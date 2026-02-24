// ─────────────────────────────────────────────────────────────────────────────
// Database Entity Types
// Comprehensive type definitions for all database tables and relationships.
// All UUID fields are typed as `string`. Timestamps use ISO 8601 string format.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Enum Types ──────────────────────────────────────────────────────────────

/** Role assigned to a user account. */
export type UserRole = 'patient' | 'professional' | 'admin'

/** Status of a professional's credential verification. */
export type VerificationStatus = 'pending' | 'verified' | 'rejected'

/** Lifecycle status of an appointment. */
export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

/** Classification of an appointment by visit sequence. */
export type AppointmentType = 'first_visit' | 'follow_up' | 'return'

/** Modality of the appointment (in person or remote). */
export type AppointmentModality = 'in_person' | 'telemedicine'

/** Payment lifecycle status. */
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'external'

/** Type of clinical record entry. */
export type RecordType =
  | 'evolution'
  | 'anamnesis'
  | 'prescription'
  | 'certificate'
  | 'referral'

/** Category of an assignable patient task. */
export type TaskType =
  | 'general'
  | 'meal_plan'
  | 'exercise'
  | 'therapy'
  | 'medication'
  | 'check_in'

/** How often a task repeats. */
export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'monthly'

/** Lifecycle status of a task. */
export type TaskStatus = 'active' | 'completed' | 'cancelled'

/** Priority level for a task. */
export type TaskPriority = 'low' | 'medium' | 'high'

/** Classification category for uploaded documents. */
export type DocumentCategory =
  | 'exam'
  | 'prescription'
  | 'meal_plan'
  | 'exercise_plan'
  | 'certificate'
  | 'report'
  | 'photo'
  | 'other'

/** Subscription plan tier. */
export type PlanType = 'free' | 'pro' | 'clinic'

/** Current state of a subscription. */
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing'

/** Classification of a platform notification. */
export type NotificationType =
  | 'appointment_reminder'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'new_message'
  | 'new_review'
  | 'task_assigned'
  | 'task_completed'
  | 'document_shared'

/** Role of a member within an organization. */
export type OrgMemberRole = 'admin' | 'member'

/** Type of professional registration council (e.g., CRM, CRP). */
export type RegistrationType = 'CRM' | 'CRP' | 'CRN' | 'CREFITO' | 'CRFa' | 'CREF'

// ─── Shared / Embedded Types ─────────────────────────────────────────────────

/** Brazilian postal address. Used as a JSON column in multiple tables. */
export interface Address {
  /** Street name (logradouro). */
  street?: string
  /** Street number. */
  number?: string
  /** Additional address info (apartment, suite, etc.). */
  complement?: string
  /** Neighborhood (bairro). */
  neighborhood?: string
  /** City name. */
  city: string
  /** Two-letter Brazilian state abbreviation (e.g., "SP", "RJ"). */
  state: string
  /** Eight-digit ZIP code (CEP) without formatting. */
  zipCode?: string
}

/**
 * A single time window within a day's schedule.
 * Times are in HH:mm format (24-hour clock).
 */
export interface TimeSlot {
  /** Start time in HH:mm format. */
  startTime: string
  /** End time in HH:mm format. */
  endTime: string
}

/** Configuration for a single day in a weekly schedule. */
export interface DaySchedule {
  /** Whether the professional is available on this day. */
  enabled: boolean
  /** Available time slots for this day. */
  slots: TimeSlot[]
}

/** Full weekly availability schedule stored as JSON. */
export interface WeeklySchedule {
  sunday: DaySchedule
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
}

// ─── Core Entity Interfaces ──────────────────────────────────────────────────

/**
 * User profile stored in the `profiles` table.
 * Created automatically via a trigger when a new auth user is registered.
 * The `id` matches the Supabase Auth user ID.
 */
export interface Profile {
  /** UUID — matches the Supabase Auth user ID. */
  id: string
  /** User's full legal name. */
  full_name: string
  /** User's email address. */
  email: string
  /** Account role determining access level and UI. */
  role: UserRole
  /** URL to the user's avatar image, or null if not set. */
  avatar_url: string | null
  /** ISO 8601 timestamp of when the profile was created. */
  created_at: string
  /** ISO 8601 timestamp of the last profile update. */
  updated_at: string
}

/**
 * Health specialty (e.g., "Nutrição", "Psicologia").
 * Referenced by professional profiles.
 */
export interface Specialty {
  /** UUID primary key. */
  id: string
  /** Unique machine-readable slug (e.g., "nutricao", "psicologia"). */
  slug: string
  /** Human-readable specialty name in Portuguese. */
  name: string
  /** Optional description of what this specialty covers. */
  description: string | null
  /** Icon identifier used in the UI (maps to an icon library component name). */
  icon: string | null
  /** ISO 8601 timestamp of creation. */
  created_at: string
}

/**
 * Extended profile for health professionals.
 * Contains credentials, pricing, and verification status.
 */
export interface ProfessionalProfile {
  /** UUID primary key. */
  id: string
  /** Foreign key referencing `profiles.id`. */
  profile_id: string
  /** Name displayed on the marketplace and in appointments. */
  display_name: string
  /** Type of professional council registration (e.g., "CRM", "CRP"). */
  registration_type: string
  /** Professional council registration number. */
  registration_number: string
  /** Two-letter state abbreviation where the registration was issued. */
  registration_state: string
  /** Foreign key referencing `specialties.id`, or the specialty slug. */
  specialty: string
  /** Professional biography / about text. */
  bio: string | null
  /** Contact phone number (digits only). */
  phone: string
  /** Consultation price in Brazilian cents (centavos). Null if not set. */
  consultation_price_cents: number | null
  /** Default duration of a consultation in minutes. Null if not set. */
  consultation_duration_minutes: number | null
  /** Whether the professional accepts health insurance plans. */
  accepts_insurance: boolean
  /** List of accepted insurance plan names, if applicable. */
  accepted_insurances: string[]
  /** Whether the professional offers remote (telemedicine) appointments. */
  offers_telemedicine: boolean
  /** Current verification status of professional credentials. */
  verification_status: VerificationStatus
  /** Legacy boolean field — true if status is 'verified'. */
  verified: boolean
  /** Average review rating (1-5 scale). */
  rating_average: number
  /** Total number of reviews received. */
  rating_count: number
  /** Professional's office/clinic address, stored as JSON. */
  address: Address | null
  /** Languages spoken by the professional (e.g., ["pt", "en"]). */
  languages: string[]
  /** ISO 8601 timestamp of creation. */
  created_at: string
  /** ISO 8601 timestamp of the last update. */
  updated_at: string
}

/**
 * Organization (clinic or practice) that groups multiple professionals.
 * Available on the "Clínica" plan.
 */
export interface Organization {
  /** UUID primary key. */
  id: string
  /** Organization display name. */
  name: string
  /** URL-safe unique slug used in marketplace URLs. */
  slug: string
  /** CNPJ (Brazilian tax ID for legal entities), digits only. */
  cnpj: string | null
  /** Contact phone number (digits only). */
  phone: string | null
  /** Contact email address. */
  email: string | null
  /** Organization description / about text. */
  description: string | null
  /** URL to the organization's logo image. */
  logo_url: string | null
  /** Physical address, stored as JSON. */
  address: Address | null
  /** UUID of the user who owns/created this organization. */
  owner_id: string
  /** ISO 8601 timestamp of creation. */
  created_at: string
  /** ISO 8601 timestamp of the last update. */
  updated_at: string
}

/**
 * Membership linking a professional to an organization.
 */
export interface OrganizationMember {
  /** UUID primary key. */
  id: string
  /** Foreign key referencing `organizations.id`. */
  organization_id: string
  /** Foreign key referencing `profiles.id`. */
  user_id: string
  /** Member's role within the organization. */
  role: OrgMemberRole
  /** ISO 8601 timestamp of when the member joined. */
  joined_at: string
}

/**
 * Professional's scheduling configuration.
 * Defines weekly availability, slot duration, and booking rules.
 */
export interface ScheduleConfig {
  /** UUID primary key. */
  id: string
  /** Foreign key referencing `professional_profiles.id`. */
  professional_id: string
  /** Weekly availability windows, stored as JSON. */
  weekly_schedule: WeeklySchedule
  /** Duration of each appointment slot in minutes. */
  slot_duration_minutes: number
  /** Buffer time in minutes between consecutive appointments. */
  buffer_minutes: number
  /** How many days in advance patients can book (max lookahead). */
  advance_booking_days: number
  /** ISO 8601 timestamp of creation. */
  created_at: string
  /** ISO 8601 timestamp of the last update. */
  updated_at: string
}

/**
 * A temporary block on a professional's schedule (vacation, holiday, etc.).
 * Prevents bookings during the blocked period.
 */
export interface ScheduleBlock {
  /** UUID primary key. */
  id: string
  /** Foreign key referencing `professional_profiles.id`. */
  professional_id: string
  /** Start date of the block (YYYY-MM-DD). */
  start_date: string
  /** End date of the block (YYYY-MM-DD), inclusive. */
  end_date: string
  /** Start time of the block (HH:mm). Null means all day. */
  start_time: string | null
  /** End time of the block (HH:mm). Null means all day. */
  end_time: string | null
  /** Reason for the schedule block. */
  reason: string | null
  /** ISO 8601 timestamp of creation. */
  created_at: string
}

/**
 * An appointment between a patient and a professional.
 */
export interface Appointment {
  /** UUID primary key. */
  id: string
  /** Foreign key referencing the professional's `profiles.id`. */
  professional_id: string
  /** Foreign key referencing the patient's `profiles.id`. */
  patient_id: string
  /** Foreign key referencing `organizations.id`, if booked through a clinic. */
  organization_id: string | null
  /** Date of the appointment (YYYY-MM-DD). */
  date: string
  /** Start time (HH:mm). */
  start_time: string
  /** End time (HH:mm). */
  end_time: string
  /** Current lifecycle status. */
  status: AppointmentStatus
  /** Classification by visit sequence. */
  type: AppointmentType
  /** Whether this is an in-person or telemedicine appointment. */
  modality: AppointmentModality
  /** Patient-provided reason for the visit. */
  reason: string | null
  /** Internal notes (visible only to the professional). */
  notes: string | null
  /** Consultation price in Brazilian cents at the time of booking. */
  price_cents: number | null
  /** Payment status for this appointment. */
  payment_status: PaymentStatus
  /** External payment reference ID (e.g., Stripe payment intent). */
  payment_reference: string | null
  /** URL for the telemedicine video call, if applicable. */
  meeting_url: string | null
  /** ISO 8601 timestamp when the appointment was cancelled, if applicable. */
  cancelled_at: string | null
  /** Reason provided for cancellation. */
  cancellation_reason: string | null
  /** ISO 8601 timestamp of creation. */
  created_at: string
  /** ISO 8601 timestamp of the last update. */
  updated_at: string
}

/**
 * A clinical record entry (electronic health record / prontuário).
 * Each entry belongs to a specific appointment or is standalone.
 */
export interface ClinicalRecord {
  /** UUID primary key. */
  id: string
  /** Foreign key referencing the professional's `profiles.id`. */
  professional_id: string
  /** Foreign key referencing the patient's `profiles.id`. */
  patient_id: string
  /** Foreign key referencing `appointments.id`, if linked to an appointment. */
  appointment_id: string | null
  /** Type of clinical record. */
  type: RecordType
  /** Title or summary of the record. */
  title: string
  /** Full content of the clinical record (may contain rich text/markdown). */
  content: string
  /** Whether the record is visible to the patient. */
  is_visible_to_patient: boolean
  /** Whether the record has been digitally signed by the professional. */
  is_signed: boolean
  /** ISO 8601 timestamp of when the record was signed. */
  signed_at: string | null
  /** Structured metadata stored as JSON (e.g., vital signs, measurements). */
  metadata: Record<string, unknown> | null
  /** ISO 8601 timestamp of creation. */
  created_at: string
  /** ISO 8601 timestamp of the last update. */
  updated_at: string
}

/**
 * A reusable form template created by a professional or organization.
 * Templates define the structure; submissions store the responses.
 */
export interface FormTemplate {
  /** UUID primary key. */
  id: string
  /** Foreign key referencing the creator's `profiles.id`. */
  professional_id: string
  /** Foreign key referencing `organizations.id`, if owned by a clinic. */
  organization_id: string | null
  /** Display name of the form template. */
  name: string
  /** Description of the form's purpose. */
  description: string | null
  /** JSON schema defining the form structure (see FormSchema type in forms.ts). */
  schema: Record<string, unknown>
  /** Whether this template is currently active and available for use. */
  is_active: boolean
  /** Whether this is a system-provided default template. */
  is_default: boolean
  /** ISO 8601 timestamp of creation. */
  created_at: string
  /** ISO 8601 timestamp of the last update. */
  updated_at: string
}

/**
 * A completed form submission from a patient.
 */
export interface FormSubmission {
  /** UUID primary key. */
  id: string
  /** Foreign key referencing `form_templates.id`. */
  template_id: string
  /** Foreign key referencing the patient's `profiles.id`. */
  patient_id: string
  /** Foreign key referencing the professional's `profiles.id`. */
  professional_id: string
  /** Foreign key referencing `appointments.id`, if submitted for a specific visit. */
  appointment_id: string | null
  /** The submitted form responses stored as JSON. Keys are field IDs. */
  responses: Record<string, unknown>
  /** ISO 8601 timestamp of when the form was submitted. */
  submitted_at: string
  /** ISO 8601 timestamp of creation. */
  created_at: string
}

/**
 * A task assigned to a patient by a professional (e.g., follow a meal plan,
 * take medication, perform exercises).
 */
export interface Task {
  /** UUID primary key. */
  id: string
  /** Foreign key referencing the professional's `profiles.id` who assigned the task. */
  professional_id: string
  /** Foreign key referencing the patient's `profiles.id`. */
  patient_id: string
  /** Short title describing the task. */
  title: string
  /** Detailed description or instructions. */
  description: string | null
  /** Category of the task. */
  type: TaskType
  /** Priority level. */
  priority: TaskPriority
  /** Current lifecycle status. */
  status: TaskStatus
  /** How often this task repeats. */
  recurrence: TaskRecurrence
  /** Date by which the task should be completed (YYYY-MM-DD). Null if no deadline. */
  due_date: string | null
  /** Start date for recurring tasks (YYYY-MM-DD). */
  start_date: string | null
  /** End date for recurring tasks (YYYY-MM-DD). Null means indefinite. */
  end_date: string | null
  /** Additional structured data (e.g., exercise reps, meal details). */
  metadata: Record<string, unknown> | null
  /** ISO 8601 timestamp of creation. */
  created_at: string
  /** ISO 8601 timestamp of the last update. */
  updated_at: string
}

/**
 * A completion record for a task (or a single occurrence of a recurring task).
 */
export interface TaskCompletion {
  /** UUID primary key. */
  id: string
  /** Foreign key referencing `tasks.id`. */
  task_id: string
  /** Foreign key referencing the patient's `profiles.id` who completed the task. */
  completed_by: string
  /** ISO 8601 timestamp of when the task was completed. */
  completed_at: string
  /** Optional note from the patient about the completion. */
  notes: string | null
  /** Date this completion applies to (YYYY-MM-DD), for recurring tasks. */
  completion_date: string
}

/**
 * A conversation thread between two users (typically patient and professional).
 */
export interface Conversation {
  /** UUID primary key. */
  id: string
  /** Foreign key referencing the first participant's `profiles.id`. */
  participant_one_id: string
  /** Foreign key referencing the second participant's `profiles.id`. */
  participant_two_id: string
  /** Foreign key referencing the last `messages.id` in this conversation. */
  last_message_id: string | null
  /** ISO 8601 timestamp of the last activity in this conversation. */
  last_message_at: string | null
  /** ISO 8601 timestamp of creation. */
  created_at: string
  /** ISO 8601 timestamp of the last update. */
  updated_at: string
}

/**
 * A single message within a conversation.
 */
export interface Message {
  /** UUID primary key. */
  id: string
  /** Foreign key referencing `conversations.id`. */
  conversation_id: string
  /** Foreign key referencing the sender's `profiles.id`. */
  sender_id: string
  /** Text content of the message. */
  content: string
  /** Whether the recipient has read the message. */
  is_read: boolean
  /** ISO 8601 timestamp of when the message was read. */
  read_at: string | null
  /** Optional file attachment URL. */
  attachment_url: string | null
  /** MIME type of the attachment, if present. */
  attachment_type: string | null
  /** ISO 8601 timestamp of creation. */
  created_at: string
}

/**
 * A patient review of a professional, linked to a completed appointment.
 */
export interface Review {
  /** UUID primary key. */
  id: string
  /** Foreign key referencing `appointments.id` that this review is for. */
  appointment_id: string
  /** Foreign key referencing the patient's `profiles.id`. */
  patient_id: string
  /** Foreign key referencing the professional's `profiles.id`. */
  professional_id: string
  /** Rating score from 1 to 5. */
  rating: number
  /** Optional written comment. */
  comment: string | null
  /** Whether the review is visible to the public. */
  is_visible: boolean
  /** Optional professional response to the review. */
  professional_response: string | null
  /** ISO 8601 timestamp of when the professional responded. */
  responded_at: string | null
  /** ISO 8601 timestamp of creation. */
  created_at: string
  /** ISO 8601 timestamp of the last update. */
  updated_at: string
}

/**
 * A document or file uploaded by a patient or professional.
 */
export interface Document {
  /** UUID primary key. */
  id: string
  /** Foreign key referencing the uploader's `profiles.id`. */
  uploaded_by: string
  /** Foreign key referencing the patient's `profiles.id` this document belongs to. */
  patient_id: string
  /** Foreign key referencing the professional's `profiles.id`, if applicable. */
  professional_id: string | null
  /** Foreign key referencing `appointments.id`, if linked to a specific visit. */
  appointment_id: string | null
  /** Human-readable file name. */
  name: string
  /** Original file name as uploaded. */
  original_name: string
  /** Category classification of the document. */
  category: DocumentCategory
  /** MIME type of the file (e.g., "application/pdf", "image/jpeg"). */
  mime_type: string
  /** File size in bytes. */
  size_bytes: number
  /** Storage path or URL in the file storage system. */
  storage_path: string
  /** Optional description or notes about the document. */
  description: string | null
  /** Whether the document is visible to the patient. */
  is_visible_to_patient: boolean
  /** ISO 8601 timestamp of creation. */
  created_at: string
}

/**
 * A professional's subscription to a paid plan.
 */
export interface Subscription {
  /** UUID primary key. */
  id: string
  /** Foreign key referencing `profiles.id` of the subscribing user. */
  user_id: string
  /** The plan tier. */
  plan: PlanType
  /** Current subscription status. */
  status: SubscriptionStatus
  /** External payment provider subscription ID (e.g., Stripe subscription ID). */
  provider_subscription_id: string | null
  /** External payment provider customer ID. */
  provider_customer_id: string | null
  /** Price in Brazilian cents being charged per billing cycle. */
  price_cents: number
  /** ISO 8601 timestamp of the current billing period start. */
  current_period_start: string
  /** ISO 8601 timestamp of the current billing period end. */
  current_period_end: string
  /** ISO 8601 timestamp of when the trial ends, if applicable. */
  trial_end: string | null
  /** ISO 8601 timestamp of when the subscription was cancelled. */
  cancelled_at: string | null
  /** ISO 8601 timestamp of creation. */
  created_at: string
  /** ISO 8601 timestamp of the last update. */
  updated_at: string
}

/**
 * A notification sent to a user (in-app, email, or push).
 */
export interface Notification {
  /** UUID primary key. */
  id: string
  /** Foreign key referencing the recipient's `profiles.id`. */
  user_id: string
  /** Classification of the notification. */
  type: NotificationType
  /** Notification title / headline. */
  title: string
  /** Notification body text. */
  body: string
  /** Structured payload with context-specific data (e.g., appointment ID). */
  data: Record<string, unknown> | null
  /** Whether the notification has been read. */
  is_read: boolean
  /** ISO 8601 timestamp of when the notification was read. */
  read_at: string | null
  /** ISO 8601 timestamp of creation. */
  created_at: string
}

// ─── Relationship / Joined Types ─────────────────────────────────────────────
// These types represent common query results where related entities are
// joined together. Use them to type the results of Supabase `.select()` calls
// with embedded relations.

/** An appointment with the patient's profile data included. */
export interface AppointmentWithPatient extends Appointment {
  /** The patient's profile. */
  patient: Profile
}

/** An appointment with the professional's profile data included. */
export interface AppointmentWithProfessional extends Appointment {
  /** The professional's profile. */
  professional: Profile
}

/** An appointment with both patient and professional profiles. */
export interface AppointmentWithParticipants extends Appointment {
  /** The patient's profile. */
  patient: Profile
  /** The professional's profile. */
  professional: Profile
}

/** A fully detailed appointment with participants, review, and clinical records. */
export interface AppointmentDetail extends AppointmentWithParticipants {
  /** Review left for this appointment, if any. */
  review: Review | null
  /** Clinical records created during/for this appointment. */
  clinical_records: ClinicalRecord[]
  /** Documents associated with this appointment. */
  documents: Document[]
}

/** A professional profile with the associated user profile and specialty data. */
export interface ProfessionalWithProfile extends ProfessionalProfile {
  /** The user profile for this professional. */
  profile: Profile
}

/** A professional profile with specialty details for marketplace display. */
export interface ProfessionalWithSpecialty extends ProfessionalProfile {
  /** The specialty entity, when joined. */
  specialty_details: Specialty | null
}

/** A professional listing in the marketplace with all display data. */
export interface ProfessionalListing extends ProfessionalProfile {
  /** The user profile for this professional. */
  profile: Profile
  /** The specialty entity. */
  specialty_details: Specialty | null
  /** Recent reviews for display. */
  recent_reviews: Review[]
}

/** A review with the patient's profile included. */
export interface ReviewWithPatient extends Review {
  /** The patient who wrote the review. */
  patient: Profile
}

/** A review with both patient and professional profiles. */
export interface ReviewWithParticipants extends Review {
  /** The patient who wrote the review. */
  patient: Profile
  /** The professional being reviewed. */
  professional: Profile
}

/** A clinical record with the professional who created it. */
export interface ClinicalRecordWithProfessional extends ClinicalRecord {
  /** The professional who authored the record. */
  professional: Profile
}

/** A clinical record with patient and professional data. */
export interface ClinicalRecordWithParticipants extends ClinicalRecord {
  /** The patient this record belongs to. */
  patient: Profile
  /** The professional who authored the record. */
  professional: Profile
}

/** A message with the sender's profile. */
export interface MessageWithSender extends Message {
  /** The profile of the user who sent this message. */
  sender: Profile
}

/** A conversation with both participants' profiles and the last message. */
export interface ConversationWithParticipants extends Conversation {
  /** Profile of the first participant. */
  participant_one: Profile
  /** Profile of the second participant. */
  participant_two: Profile
  /** The most recent message in the conversation. */
  last_message: Message | null
  /** Number of unread messages for the current user. */
  unread_count: number
}

/** A task with both professional and patient profiles. */
export interface TaskWithParticipants extends Task {
  /** The professional who assigned the task. */
  professional: Profile
  /** The patient the task is assigned to. */
  patient: Profile
}

/** A task with its completion history. */
export interface TaskWithCompletions extends Task {
  /** All completion records for this task. */
  completions: TaskCompletion[]
}

/** A document with the uploader's profile. */
export interface DocumentWithUploader extends Document {
  /** Profile of the user who uploaded the document. */
  uploader: Profile
}

/** A form submission with template and patient data. */
export interface FormSubmissionWithDetails extends FormSubmission {
  /** The form template that was filled out. */
  template: FormTemplate
  /** The patient who submitted the form. */
  patient: Profile
}

/** An organization with its members and their profiles. */
export interface OrganizationWithMembers extends Organization {
  /** All members of this organization. */
  members: (OrganizationMember & { profile: Profile })[]
}

/** An organization member with their profile and the organization. */
export interface OrganizationMemberWithDetails extends OrganizationMember {
  /** The member's user profile. */
  profile: Profile
  /** The organization they belong to. */
  organization: Organization
}

/** A notification with the relevant entity data resolved. */
export interface NotificationWithDetails extends Notification {
  /** The related appointment, if this is an appointment notification. */
  appointment: Appointment | null
  /** The related conversation, if this is a message notification. */
  conversation: Conversation | null
}

/** A subscription with the subscriber's profile. */
export interface SubscriptionWithUser extends Subscription {
  /** The user who holds this subscription. */
  user: Profile
}

// ─── Insert / Update Types ───────────────────────────────────────────────────
// These types represent the data shape for creating or updating entities.
// They omit server-generated fields like `id`, `created_at`, `updated_at`,
// and computed fields.

/** Data required to create a new profile (typically handled by auth trigger). */
export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>

/** Fields that can be updated on a profile. */
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'email' | 'created_at'>>

/** Data required to create a new professional profile. */
export type ProfessionalProfileInsert = Omit<
  ProfessionalProfile,
  'id' | 'verified' | 'verification_status' | 'rating_average' | 'rating_count' | 'created_at' | 'updated_at'
>

/** Fields that can be updated on a professional profile. */
export type ProfessionalProfileUpdate = Partial<
  Omit<ProfessionalProfile, 'id' | 'profile_id' | 'rating_average' | 'rating_count' | 'created_at'>
>

/** Data required to create a new appointment. */
export type AppointmentInsert = Omit<
  Appointment,
  'id' | 'cancelled_at' | 'cancellation_reason' | 'created_at' | 'updated_at'
>

/** Fields that can be updated on an appointment. */
export type AppointmentUpdate = Partial<
  Omit<Appointment, 'id' | 'professional_id' | 'patient_id' | 'created_at'>
>

/** Data required to create a new clinical record. */
export type ClinicalRecordInsert = Omit<
  ClinicalRecord,
  'id' | 'is_signed' | 'signed_at' | 'created_at' | 'updated_at'
>

/** Fields that can be updated on a clinical record. */
export type ClinicalRecordUpdate = Partial<
  Omit<ClinicalRecord, 'id' | 'professional_id' | 'patient_id' | 'created_at'>
>

/** Data required to create a new task. */
export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>

/** Fields that can be updated on a task. */
export type TaskUpdate = Partial<Omit<Task, 'id' | 'professional_id' | 'patient_id' | 'created_at'>>

/** Data required to create a new message. */
export type MessageInsert = Omit<Message, 'id' | 'is_read' | 'read_at' | 'created_at'>

/** Data required to create a new review. */
export type ReviewInsert = Omit<
  Review,
  'id' | 'is_visible' | 'professional_response' | 'responded_at' | 'created_at' | 'updated_at'
>

/** Data required to create a new document record. */
export type DocumentInsert = Omit<Document, 'id' | 'created_at'>

/** Data required to create a new organization. */
export type OrganizationInsert = Omit<Organization, 'id' | 'logo_url' | 'created_at' | 'updated_at'>

/** Fields that can be updated on an organization. */
export type OrganizationUpdate = Partial<Omit<Organization, 'id' | 'owner_id' | 'created_at'>>

/** Data required to create a new notification. */
export type NotificationInsert = Omit<Notification, 'id' | 'is_read' | 'read_at' | 'created_at'>
