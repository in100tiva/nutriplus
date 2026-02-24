-- ============================================================================
-- NutriPlus Health Hub Platform - Initial Database Schema
-- Migration: 00001_initial_schema.sql
-- Description: Complete schema for a medical/health platform connecting
--              health professionals with patients.
-- ============================================================================

-- ============================================================================
-- 0. EXTENSIONS
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. CUSTOM TYPES (ENUMS)
-- ============================================================================

create type user_role as enum ('patient', 'professional', 'admin');

create type verification_status as enum ('pending', 'verified', 'rejected');

create type organization_plan as enum ('free', 'pro', 'clinic');

create type organization_member_role as enum ('admin', 'member');

create type appointment_status as enum (
  'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
);

create type appointment_type as enum ('first_visit', 'follow_up', 'return');

create type payment_status as enum ('pending', 'paid', 'refunded', 'external');

create type clinical_record_type as enum (
  'evolution', 'anamnesis', 'prescription', 'certificate', 'referral'
);

create type task_type as enum (
  'general', 'meal_plan', 'exercise', 'therapy', 'medication', 'check_in'
);

create type task_recurrence as enum ('none', 'daily', 'weekly', 'monthly');

create type task_status as enum ('active', 'completed', 'cancelled');

create type document_category as enum (
  'exam', 'prescription', 'meal_plan', 'exercise_plan',
  'certificate', 'report', 'photo', 'other'
);

create type subscription_plan as enum ('free', 'pro', 'clinic');

create type subscription_status as enum (
  'active', 'cancelled', 'past_due', 'trialing'
);

create type notification_type as enum (
  'appointment_reminder', 'appointment_confirmed', 'appointment_cancelled',
  'new_message', 'new_review', 'task_assigned', 'task_completed',
  'document_shared'
);

-- ============================================================================
-- 2. HELPER FUNCTIONS
-- ============================================================================

-- Trigger function: automatically sets updated_at on row modification
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Function: auto-create a profile row when a new auth.users row is inserted
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'patient')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Trigger on auth.users to auto-create profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

-- ============================================================================
-- 3. TABLES
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 3.1 profiles
-- ---------------------------------------------------------------------------
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text not null default '',
  avatar_url text,
  phone      text,
  role       user_role not null default 'patient',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

comment on table profiles is 'Extends Supabase auth.users with application-level profile data.';

-- ---------------------------------------------------------------------------
-- 3.2 specialties
-- ---------------------------------------------------------------------------
create table specialties (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  slug        text not null unique,
  description text,
  icon        text,
  created_at  timestamptz not null default now()
);

comment on table specialties is 'Lookup table of medical/health specialties.';

-- ---------------------------------------------------------------------------
-- 3.3 professional_profiles
-- ---------------------------------------------------------------------------
create table professional_profiles (
  id                          uuid primary key default uuid_generate_v4(),
  profile_id                  uuid not null references profiles(id) on delete cascade,
  specialty_id                uuid not null references specialties(id) on delete restrict,
  registration_number         text not null,
  registration_type           text not null, -- CRM, CRP, CRN, CREFITO, etc.
  verification_status         verification_status not null default 'pending',
  bio                         text,
  short_description           text,
  consultation_price_cents    integer not null default 0,
  consultation_duration_minutes integer not null default 30,
  accepts_insurance           boolean not null default false,
  insurance_list              text[],
  city                        text,
  state                       text,
  is_online_enabled           boolean not null default false,
  rating_average              numeric(3,2) not null default 0,
  rating_count                integer not null default 0,
  is_public                   boolean not null default false,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),

  constraint uq_professional_profile unique (profile_id),
  constraint uq_registration unique (registration_type, registration_number),
  constraint chk_price_positive check (consultation_price_cents >= 0),
  constraint chk_duration_positive check (consultation_duration_minutes > 0),
  constraint chk_rating_range check (rating_average >= 0 and rating_average <= 5),
  constraint chk_rating_count_positive check (rating_count >= 0)
);

create trigger professional_profiles_updated_at
  before update on professional_profiles
  for each row execute function set_updated_at();

comment on table professional_profiles is 'Professional-specific data extending a profile.';

-- ---------------------------------------------------------------------------
-- 3.4 organizations
-- ---------------------------------------------------------------------------
create table organizations (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  description text,
  logo_url    text,
  owner_id    uuid not null references profiles(id) on delete restrict,
  city        text,
  state       text,
  address     text,
  phone       text,
  email       text,
  plan        organization_plan not null default 'free',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger organizations_updated_at
  before update on organizations
  for each row execute function set_updated_at();

comment on table organizations is 'Clinics and offices that group professionals.';

-- ---------------------------------------------------------------------------
-- 3.5 organization_members
-- ---------------------------------------------------------------------------
create table organization_members (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  profile_id      uuid not null references profiles(id) on delete cascade,
  role            organization_member_role not null default 'member',
  joined_at       timestamptz not null default now(),

  constraint uq_org_member unique (organization_id, profile_id)
);

comment on table organization_members is 'Membership of professionals/admins in organizations.';

-- ---------------------------------------------------------------------------
-- 3.6 schedule_configs
-- ---------------------------------------------------------------------------
create table schedule_configs (
  id                          uuid primary key default uuid_generate_v4(),
  professional_id             uuid not null references professional_profiles(id) on delete cascade,
  day_of_week                 smallint not null,
  start_time                  time not null,
  end_time                    time not null,
  slot_duration_minutes       integer not null default 30,
  break_between_slots_minutes integer not null default 0,
  is_active                   boolean not null default true,

  constraint chk_day_of_week check (day_of_week between 0 and 6),
  constraint chk_time_order check (end_time > start_time),
  constraint chk_slot_duration check (slot_duration_minutes > 0),
  constraint chk_break_non_negative check (break_between_slots_minutes >= 0)
);

comment on table schedule_configs is 'Weekly availability configuration for each professional.';

-- ---------------------------------------------------------------------------
-- 3.7 schedule_blocks
-- ---------------------------------------------------------------------------
create table schedule_blocks (
  id              uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references professional_profiles(id) on delete cascade,
  start_date      timestamptz not null,
  end_date        timestamptz not null,
  reason          text,

  constraint chk_block_date_order check (end_date > start_date)
);

comment on table schedule_blocks is 'Blocked time periods where a professional is unavailable.';

-- ---------------------------------------------------------------------------
-- 3.8 appointments
-- ---------------------------------------------------------------------------
create table appointments (
  id                  uuid primary key default uuid_generate_v4(),
  professional_id     uuid not null references professional_profiles(id) on delete restrict,
  patient_id          uuid not null references profiles(id) on delete restrict,
  scheduled_date      date not null,
  scheduled_time      time not null,
  duration_minutes    integer not null default 30,
  status              appointment_status not null default 'scheduled',
  type                appointment_type not null default 'first_visit',
  notes               text,
  price_cents         integer not null default 0,
  payment_status      payment_status not null default 'pending',
  cancellation_reason text,
  meeting_link        text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint chk_appt_duration check (duration_minutes > 0),
  constraint chk_appt_price check (price_cents >= 0)
);

create trigger appointments_updated_at
  before update on appointments
  for each row execute function set_updated_at();

comment on table appointments is 'Scheduled consultations between professionals and patients.';

-- ---------------------------------------------------------------------------
-- 3.9 clinical_records
-- ---------------------------------------------------------------------------
create table clinical_records (
  id              uuid primary key default uuid_generate_v4(),
  appointment_id  uuid not null references appointments(id) on delete cascade,
  professional_id uuid not null references professional_profiles(id) on delete restrict,
  patient_id      uuid not null references profiles(id) on delete restrict,
  content         text not null,
  record_type     clinical_record_type not null default 'evolution',
  metadata        jsonb default '{}',
  is_private      boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger clinical_records_updated_at
  before update on clinical_records
  for each row execute function set_updated_at();

comment on table clinical_records is 'Clinical evolution / progress notes per appointment.';

-- ---------------------------------------------------------------------------
-- 3.10 form_templates
-- ---------------------------------------------------------------------------
create table form_templates (
  id                  uuid primary key default uuid_generate_v4(),
  professional_id     uuid references professional_profiles(id) on delete set null,
  specialty_id        uuid references specialties(id) on delete set null,
  title               text not null,
  description         text,
  schema              jsonb not null default '{}',
  is_system_template  boolean not null default false,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger form_templates_updated_at
  before update on form_templates
  for each row execute function set_updated_at();

comment on table form_templates is 'Dynamic form definitions stored as JSON Schema.';

-- ---------------------------------------------------------------------------
-- 3.11 form_submissions
-- ---------------------------------------------------------------------------
create table form_submissions (
  id               uuid primary key default uuid_generate_v4(),
  form_template_id uuid not null references form_templates(id) on delete restrict,
  patient_id       uuid not null references profiles(id) on delete restrict,
  professional_id  uuid not null references professional_profiles(id) on delete restrict,
  appointment_id   uuid references appointments(id) on delete set null,
  data             jsonb not null default '{}',
  submitted_at     timestamptz,
  created_at       timestamptz not null default now()
);

comment on table form_submissions is 'Patient-submitted form data linked to templates.';

-- ---------------------------------------------------------------------------
-- 3.12 tasks
-- ---------------------------------------------------------------------------
create table tasks (
  id              uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references professional_profiles(id) on delete restrict,
  patient_id      uuid not null references profiles(id) on delete restrict,
  title           text not null,
  description     text,
  task_type       task_type not null default 'general',
  due_date        date,
  recurrence      task_recurrence not null default 'none',
  status          task_status not null default 'active',
  metadata        jsonb default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger tasks_updated_at
  before update on tasks
  for each row execute function set_updated_at();

comment on table tasks is 'Tasks / orientations assigned by professionals to patients.';

-- ---------------------------------------------------------------------------
-- 3.13 task_completions
-- ---------------------------------------------------------------------------
create table task_completions (
  id           uuid primary key default uuid_generate_v4(),
  task_id      uuid not null references tasks(id) on delete cascade,
  completed_at timestamptz not null default now(),
  notes        text,
  metadata     jsonb default '{}'
);

comment on table task_completions is 'Records of patients completing assigned tasks.';

-- ---------------------------------------------------------------------------
-- 3.14 conversations
-- ---------------------------------------------------------------------------
create table conversations (
  id              uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references profiles(id) on delete cascade,
  patient_id      uuid not null references profiles(id) on delete cascade,
  last_message_at timestamptz,
  created_at      timestamptz not null default now(),

  constraint uq_conversation unique (professional_id, patient_id),
  constraint chk_different_participants check (professional_id <> patient_id)
);

comment on table conversations is 'Messaging threads between a professional and a patient.';

-- ---------------------------------------------------------------------------
-- 3.15 messages
-- ---------------------------------------------------------------------------
create table messages (
  id             uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id      uuid not null references profiles(id) on delete cascade,
  receiver_id    uuid not null references profiles(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  content        text not null,
  is_read        boolean not null default false,
  created_at     timestamptz not null default now()
);

comment on table messages is 'Asynchronous chat messages between users.';

-- ---------------------------------------------------------------------------
-- 3.16 reviews
-- ---------------------------------------------------------------------------
create table reviews (
  id                 uuid primary key default uuid_generate_v4(),
  appointment_id     uuid not null references appointments(id) on delete cascade,
  patient_id         uuid not null references profiles(id) on delete restrict,
  professional_id    uuid not null references professional_profiles(id) on delete restrict,
  rating             smallint not null,
  comment            text,
  professional_reply text,
  is_visible         boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint uq_review_per_appointment unique (appointment_id),
  constraint chk_rating_range check (rating between 1 and 5)
);

create trigger reviews_updated_at
  before update on reviews
  for each row execute function set_updated_at();

comment on table reviews is 'Patient reviews of completed appointments.';

-- ---------------------------------------------------------------------------
-- 3.17 documents
-- ---------------------------------------------------------------------------
create table documents (
  id              uuid primary key default uuid_generate_v4(),
  uploaded_by     uuid not null references profiles(id) on delete restrict,
  patient_id      uuid not null references profiles(id) on delete restrict,
  appointment_id  uuid references appointments(id) on delete set null,
  file_name       text not null,
  file_type       text not null,
  file_size_bytes bigint not null default 0,
  storage_path    text not null,
  category        document_category not null default 'other',
  description     text,
  created_at      timestamptz not null default now(),

  constraint chk_file_size check (file_size_bytes >= 0)
);

comment on table documents is 'File attachments stored in Supabase Storage.';

-- ---------------------------------------------------------------------------
-- 3.18 subscriptions
-- ---------------------------------------------------------------------------
create table subscriptions (
  id                   uuid primary key default uuid_generate_v4(),
  profile_id           uuid references profiles(id) on delete cascade,
  organization_id      uuid references organizations(id) on delete cascade,
  plan                 subscription_plan not null default 'free',
  status               subscription_status not null default 'active',
  current_period_start timestamptz,
  current_period_end   timestamptz,
  external_id          text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  constraint chk_subscription_owner check (
    (profile_id is not null and organization_id is null)
    or (profile_id is null and organization_id is not null)
  )
);

create trigger subscriptions_updated_at
  before update on subscriptions
  for each row execute function set_updated_at();

comment on table subscriptions is 'Plan/subscription management linked to Stripe or MercadoPago.';

-- ---------------------------------------------------------------------------
-- 3.19 notifications
-- ---------------------------------------------------------------------------
create table notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles(id) on delete cascade,
  type       notification_type not null,
  title      text not null,
  body       text,
  data       jsonb default '{}',
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table notifications is 'In-app notifications delivered to users.';

-- ============================================================================
-- 4. INDEXES
-- ============================================================================

-- profiles
create index idx_profiles_role on profiles(role);
create index idx_profiles_email on profiles(email);

-- professional_profiles
create index idx_prof_profiles_profile_id on professional_profiles(profile_id);
create index idx_prof_profiles_specialty on professional_profiles(specialty_id);
create index idx_prof_profiles_verification on professional_profiles(verification_status);
create index idx_prof_profiles_public_listing on professional_profiles(is_public, verification_status)
  where is_public = true and verification_status = 'verified';
create index idx_prof_profiles_city_state on professional_profiles(state, city);
create index idx_prof_profiles_rating on professional_profiles(rating_average desc)
  where is_public = true;

-- specialties
create index idx_specialties_slug on specialties(slug);

-- organizations
create index idx_organizations_slug on organizations(slug);
create index idx_organizations_owner on organizations(owner_id);

-- organization_members
create index idx_org_members_profile on organization_members(profile_id);
create index idx_org_members_org on organization_members(organization_id);

-- schedule_configs
create index idx_schedule_configs_prof on schedule_configs(professional_id);
create index idx_schedule_configs_prof_day on schedule_configs(professional_id, day_of_week)
  where is_active = true;

-- schedule_blocks
create index idx_schedule_blocks_prof on schedule_blocks(professional_id);
create index idx_schedule_blocks_dates on schedule_blocks(professional_id, start_date, end_date);

-- appointments
create index idx_appointments_professional on appointments(professional_id);
create index idx_appointments_patient on appointments(patient_id);
create index idx_appointments_date on appointments(scheduled_date);
create index idx_appointments_prof_date on appointments(professional_id, scheduled_date, scheduled_time);
create index idx_appointments_patient_date on appointments(patient_id, scheduled_date desc);
create index idx_appointments_status on appointments(status)
  where status in ('scheduled', 'confirmed', 'in_progress');

-- clinical_records
create index idx_clinical_records_appointment on clinical_records(appointment_id);
create index idx_clinical_records_patient on clinical_records(patient_id);
create index idx_clinical_records_professional on clinical_records(professional_id);

-- form_templates
create index idx_form_templates_professional on form_templates(professional_id);
create index idx_form_templates_specialty on form_templates(specialty_id);

-- form_submissions
create index idx_form_submissions_patient on form_submissions(patient_id);
create index idx_form_submissions_template on form_submissions(form_template_id);
create index idx_form_submissions_appointment on form_submissions(appointment_id);

-- tasks
create index idx_tasks_professional on tasks(professional_id);
create index idx_tasks_patient on tasks(patient_id);
create index idx_tasks_patient_status on tasks(patient_id, status) where status = 'active';
create index idx_tasks_due_date on tasks(due_date) where status = 'active';

-- task_completions
create index idx_task_completions_task on task_completions(task_id);

-- conversations
create index idx_conversations_professional on conversations(professional_id);
create index idx_conversations_patient on conversations(patient_id);
create index idx_conversations_last_msg on conversations(professional_id, last_message_at desc);

-- messages
create index idx_messages_conversation on messages(conversation_id, created_at desc);
create index idx_messages_sender on messages(sender_id);
create index idx_messages_receiver on messages(receiver_id);
create index idx_messages_unread on messages(receiver_id, is_read) where is_read = false;

-- reviews
create index idx_reviews_professional on reviews(professional_id);
create index idx_reviews_patient on reviews(patient_id);

-- documents
create index idx_documents_patient on documents(patient_id);
create index idx_documents_uploaded_by on documents(uploaded_by);
create index idx_documents_appointment on documents(appointment_id);

-- subscriptions
create index idx_subscriptions_profile on subscriptions(profile_id);
create index idx_subscriptions_org on subscriptions(organization_id);
create index idx_subscriptions_external on subscriptions(external_id) where external_id is not null;

-- notifications
create index idx_notifications_user on notifications(user_id, created_at desc);
create index idx_notifications_unread on notifications(user_id, is_read) where is_read = false;

-- ============================================================================
-- 5. ROW LEVEL SECURITY - ENABLE ON ALL TABLES
-- ============================================================================

alter table profiles enable row level security;
alter table specialties enable row level security;
alter table professional_profiles enable row level security;
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table schedule_configs enable row level security;
alter table schedule_blocks enable row level security;
alter table appointments enable row level security;
alter table clinical_records enable row level security;
alter table form_templates enable row level security;
alter table form_submissions enable row level security;
alter table tasks enable row level security;
alter table task_completions enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table reviews enable row level security;
alter table documents enable row level security;
alter table subscriptions enable row level security;
alter table notifications enable row level security;

-- ============================================================================
-- 6. RLS POLICIES
-- ============================================================================

-- ---- Helper: get the current user's profile role ----
create or replace function auth_user_role()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer set search_path = public;

-- ---- Helper: get the current user's professional_profile id ----
create or replace function auth_professional_id()
returns uuid as $$
  select id from professional_profiles where profile_id = auth.uid();
$$ language sql stable security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy "Users can view any profile"
  on profiles for select
  using (true);

create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Inserts handled by the trigger, but allow for completeness
create policy "Service role can insert profiles"
  on profiles for insert
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- specialties (public read, admin write)
-- ---------------------------------------------------------------------------
create policy "Anyone can view specialties"
  on specialties for select
  using (true);

create policy "Admins can manage specialties"
  on specialties for all
  using (auth_user_role() = 'admin')
  with check (auth_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- professional_profiles
-- ---------------------------------------------------------------------------
create policy "Public verified professionals are visible to all"
  on professional_profiles for select
  using (
    is_public = true and verification_status = 'verified'
    or profile_id = auth.uid()
    or auth_user_role() = 'admin'
  );

create policy "Professionals can insert own profile"
  on professional_profiles for insert
  with check (profile_id = auth.uid());

create policy "Professionals can update own profile"
  on professional_profiles for update
  using (profile_id = auth.uid() or auth_user_role() = 'admin')
  with check (profile_id = auth.uid() or auth_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------
create policy "Organizations are publicly visible"
  on organizations for select
  using (true);

create policy "Owner can insert organization"
  on organizations for insert
  with check (owner_id = auth.uid());

create policy "Owner or admin can update organization"
  on organizations for update
  using (owner_id = auth.uid() or auth_user_role() = 'admin');

create policy "Owner can delete organization"
  on organizations for delete
  using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- organization_members
-- ---------------------------------------------------------------------------
create policy "Members can view their org memberships"
  on organization_members for select
  using (
    profile_id = auth.uid()
    or organization_id in (
      select id from organizations where owner_id = auth.uid()
    )
  );

create policy "Org owner can manage members"
  on organization_members for all
  using (
    organization_id in (
      select id from organizations where owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- schedule_configs
-- ---------------------------------------------------------------------------
create policy "Professionals can manage own schedule"
  on schedule_configs for all
  using (professional_id = auth_professional_id())
  with check (professional_id = auth_professional_id());

create policy "Patients can view active schedules for booking"
  on schedule_configs for select
  using (is_active = true);

-- ---------------------------------------------------------------------------
-- schedule_blocks
-- ---------------------------------------------------------------------------
create policy "Professionals can manage own blocks"
  on schedule_blocks for all
  using (professional_id = auth_professional_id())
  with check (professional_id = auth_professional_id());

create policy "Patients can view blocks for booking"
  on schedule_blocks for select
  using (true);

-- ---------------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------------
create policy "Professionals see their appointments"
  on appointments for select
  using (professional_id = auth_professional_id());

create policy "Patients see their appointments"
  on appointments for select
  using (patient_id = auth.uid());

create policy "Admins see all appointments"
  on appointments for select
  using (auth_user_role() = 'admin');

create policy "Patients can create appointments"
  on appointments for insert
  with check (patient_id = auth.uid());

create policy "Professional can update own appointments"
  on appointments for update
  using (professional_id = auth_professional_id());

create policy "Patient can update own appointments (cancel)"
  on appointments for update
  using (patient_id = auth.uid());

-- ---------------------------------------------------------------------------
-- clinical_records
-- ---------------------------------------------------------------------------
create policy "Professional sees own clinical records"
  on clinical_records for select
  using (professional_id = auth_professional_id());

create policy "Patient sees non-private clinical records"
  on clinical_records for select
  using (patient_id = auth.uid() and is_private = false);

create policy "Professional can insert clinical records"
  on clinical_records for insert
  with check (professional_id = auth_professional_id());

create policy "Professional can update own clinical records"
  on clinical_records for update
  using (professional_id = auth_professional_id());

-- ---------------------------------------------------------------------------
-- form_templates
-- ---------------------------------------------------------------------------
create policy "Active templates are visible"
  on form_templates for select
  using (
    is_active = true
    or professional_id = auth_professional_id()
    or auth_user_role() = 'admin'
  );

create policy "Professional can manage own templates"
  on form_templates for all
  using (
    professional_id = auth_professional_id()
    or (is_system_template = true and auth_user_role() = 'admin')
  );

-- ---------------------------------------------------------------------------
-- form_submissions
-- ---------------------------------------------------------------------------
create policy "Professional sees submissions they requested"
  on form_submissions for select
  using (professional_id = auth_professional_id());

create policy "Patient sees own submissions"
  on form_submissions for select
  using (patient_id = auth.uid());

create policy "Patient can insert submissions"
  on form_submissions for insert
  with check (patient_id = auth.uid());

create policy "Patient can update own unsubmitted forms"
  on form_submissions for update
  using (patient_id = auth.uid() and submitted_at is null);

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
create policy "Professional sees assigned tasks"
  on tasks for select
  using (professional_id = auth_professional_id());

create policy "Patient sees own tasks"
  on tasks for select
  using (patient_id = auth.uid());

create policy "Professional can create tasks"
  on tasks for insert
  with check (professional_id = auth_professional_id());

create policy "Professional can update own tasks"
  on tasks for update
  using (professional_id = auth_professional_id());

-- ---------------------------------------------------------------------------
-- task_completions
-- ---------------------------------------------------------------------------
create policy "Patient can complete own tasks"
  on task_completions for insert
  with check (
    task_id in (select id from tasks where patient_id = auth.uid())
  );

create policy "Patient sees own completions"
  on task_completions for select
  using (
    task_id in (select id from tasks where patient_id = auth.uid())
  );

create policy "Professional sees completions for their tasks"
  on task_completions for select
  using (
    task_id in (select id from tasks where professional_id = auth_professional_id())
  );

-- ---------------------------------------------------------------------------
-- conversations
-- ---------------------------------------------------------------------------
create policy "Participants can view their conversations"
  on conversations for select
  using (professional_id = auth.uid() or patient_id = auth.uid());

create policy "Participants can create conversations"
  on conversations for insert
  with check (professional_id = auth.uid() or patient_id = auth.uid());

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------
create policy "Participants can view messages in their conversations"
  on messages for select
  using (sender_id = auth.uid() or receiver_id = auth.uid());

create policy "Sender can insert messages"
  on messages for insert
  with check (sender_id = auth.uid());

create policy "Receiver can mark messages as read"
  on messages for update
  using (receiver_id = auth.uid());

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
create policy "Visible reviews are public"
  on reviews for select
  using (is_visible = true or patient_id = auth.uid() or professional_id = auth_professional_id());

create policy "Patient can create review"
  on reviews for insert
  with check (patient_id = auth.uid());

create policy "Patient can update own review"
  on reviews for update
  using (patient_id = auth.uid());

create policy "Professional can reply to reviews"
  on reviews for update
  using (professional_id = auth_professional_id());

-- ---------------------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------------------
create policy "Uploader can see own documents"
  on documents for select
  using (uploaded_by = auth.uid());

create policy "Patient can see own documents"
  on documents for select
  using (patient_id = auth.uid());

create policy "Professional can see patient documents via appointment"
  on documents for select
  using (
    exists (
      select 1 from appointments a
      where a.id = documents.appointment_id
        and a.professional_id = auth_professional_id()
    )
    or exists (
      select 1 from appointments a
      where a.patient_id = documents.patient_id
        and a.professional_id = auth_professional_id()
    )
  );

create policy "Users can upload documents"
  on documents for insert
  with check (uploaded_by = auth.uid());

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------
create policy "Users can view own subscription"
  on subscriptions for select
  using (
    profile_id = auth.uid()
    or organization_id in (
      select id from organizations where owner_id = auth.uid()
    )
    or auth_user_role() = 'admin'
  );

create policy "Admins can manage subscriptions"
  on subscriptions for all
  using (auth_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
create policy "Users see own notifications"
  on notifications for select
  using (user_id = auth.uid());

create policy "Users can mark own notifications read"
  on notifications for update
  using (user_id = auth.uid());

create policy "System can insert notifications"
  on notifications for insert
  with check (true);

-- ============================================================================
-- 7. ADDITIONAL FUNCTIONS
-- ============================================================================

-- Function: update professional rating aggregates after a review is inserted/updated
create or replace function update_professional_rating()
returns trigger as $$
declare
  v_avg numeric(3,2);
  v_count integer;
begin
  select
    coalesce(avg(rating)::numeric(3,2), 0),
    count(*)
  into v_avg, v_count
  from reviews
  where professional_id = coalesce(new.professional_id, old.professional_id)
    and is_visible = true;

  update professional_profiles
  set rating_average = v_avg,
      rating_count = v_count
  where id = coalesce(new.professional_id, old.professional_id);

  return coalesce(new, old);
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_review_update_rating
  after insert or update or delete on reviews
  for each row execute function update_professional_rating();

-- Function: update conversation.last_message_at when a message is inserted
create or replace function update_conversation_last_message()
returns trigger as $$
begin
  update conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_message_update_conversation
  after insert on messages
  for each row execute function update_conversation_last_message();

-- ============================================================================
-- 8. SEED DATA - SPECIALTIES
-- ============================================================================

insert into specialties (name, slug, description, icon) values
  ('Nutricao',        'nutricao',        'Profissional especializado em alimentacao e nutricao.',             'utensils'),
  ('Psicologia',      'psicologia',      'Profissional especializado em saude mental e comportamento.',      'brain'),
  ('Medicina Geral',  'medicina-geral',  'Medico generalista para atendimento clinico geral.',               'stethoscope'),
  ('Fisioterapia',    'fisioterapia',    'Profissional especializado em reabilitacao fisica.',               'accessibility'),
  ('Dermatologia',    'dermatologia',    'Medico especialista em pele, cabelos e unhas.',                    'hand'),
  ('Cardiologia',     'cardiologia',     'Medico especialista em doencas do coracao.',                       'heart-pulse'),
  ('Endocrinologia',  'endocrinologia',  'Medico especialista em hormonios e metabolismo.',                  'flask-conical'),
  ('Pediatria',       'pediatria',       'Medico especialista em saude infantil.',                           'baby'),
  ('Psiquiatria',     'psiquiatria',     'Medico especialista em transtornos mentais e uso de medicamentos.','pill'),
  ('Fonoaudiologia',  'fonoaudiologia',  'Profissional especializado em comunicacao, voz e audicao.',        'ear');

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
