-- ============================================================================
-- BASELINE — Consultório Digital para Nutricionistas (MVP)
-- Consolida as 10 migrations iniciais (001..010) aplicadas via Supabase MCP.
-- Versão única de referência; em produção, alterações futuras vão como
-- migrations incrementais (não editar este arquivo).
-- Spec: .planning/SPEC.md
-- ============================================================================

-- ───── 001 — Extensões + helpers ────────────────────────────────────────────
create extension if not exists pgcrypto with schema extensions;
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists pg_stat_statements with schema extensions;
create extension if not exists pg_trgm with schema extensions;
create extension if not exists btree_gist with schema extensions;
create extension if not exists pg_cron;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('nutricionista', 'paciente', 'admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'agendamento_status') then
    create type public.agendamento_status as enum ('pendente_pagamento','confirmado','realizado','cancelado','falta');
  end if;
  if not exists (select 1 from pg_type where typname = 'lembrete_tipo') then
    create type public.lembrete_tipo as enum ('24h','1h');
  end if;
  if not exists (select 1 from pg_type where typname = 'lembrete_canal') then
    create type public.lembrete_canal as enum ('email');
  end if;
  if not exists (select 1 from pg_type where typname = 'evento_severidade') then
    create type public.evento_severidade as enum ('info','aviso','erro');
  end if;
  if not exists (select 1 from pg_type where typname = 'job_status') then
    create type public.job_status as enum ('ok','erro','parcial');
  end if;
  if not exists (select 1 from pg_type where typname = 'assinatura_status') then
    create type public.assinatura_status as enum ('ativa','inadimplente','cancelada');
  end if;
  if not exists (select 1 from pg_type where typname = 'pagamento_metodo') then
    create type public.pagamento_metodo as enum ('pix','cartao');
  end if;
  if not exists (select 1 from pg_type where typname = 'assinatura_ciclo') then
    create type public.assinatura_ciclo as enum ('WEEKLY','MONTHLY','SEMIANNUALLY','ANNUALLY');
  end if;
end$$;

-- ───── 002 — Observabilidade barata (§9.2) ──────────────────────────────────
create table public.eventos_sistema (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  request_id text,
  entidade text,
  entidade_id uuid,
  payload jsonb not null default '{}'::jsonb,
  severidade public.evento_severidade not null default 'info',
  created_at timestamptz not null default now()
);
create index eventos_sistema_tipo_idx       on public.eventos_sistema (tipo);
create index eventos_sistema_severidade_idx on public.eventos_sistema (severidade, created_at desc);
create index eventos_sistema_request_idx    on public.eventos_sistema (request_id);
create index eventos_sistema_entidade_idx   on public.eventos_sistema (entidade, entidade_id);
alter table public.eventos_sistema enable row level security;
revoke all on public.eventos_sistema from anon, authenticated;

create table public.execucoes_jobs (
  id uuid primary key default gen_random_uuid(),
  job_nome text not null,
  iniciado_em timestamptz not null default now(),
  finalizado_em timestamptz,
  status public.job_status not null default 'ok',
  itens_processados integer not null default 0,
  itens_falha integer not null default 0,
  detalhe jsonb
);
create index execucoes_jobs_nome_iniciado_idx on public.execucoes_jobs (job_nome, iniciado_em desc);
alter table public.execucoes_jobs enable row level security;
revoke all on public.execucoes_jobs from anon, authenticated;

create or replace function public.registrar_evento(
  p_tipo text,
  p_request_id text default null,
  p_entidade text default null,
  p_entidade_id uuid default null,
  p_payload jsonb default '{}'::jsonb,
  p_severidade public.evento_severidade default 'info'
) returns uuid
language plpgsql security definer set search_path = public
as $$
declare v_id uuid;
begin
  insert into public.eventos_sistema (tipo, request_id, entidade, entidade_id, payload, severidade)
  values (p_tipo, p_request_id, p_entidade, p_entidade_id, p_payload, p_severidade)
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.registrar_evento(text, text, text, uuid, jsonb, public.evento_severidade) from public, anon, authenticated;

-- ───── 003 — profiles + trigger auth ────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'paciente',
  nome text not null default '',
  telefone text,
  avatar_url text,
  consentimento_lgpd_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_role_idx on public.profiles (role);
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();
alter table public.profiles enable row level security;

create policy "profiles_self_select" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles_self_update" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create or replace function public.current_user_role()
returns public.user_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = (select auth.uid()) $$;
grant execute on function public.current_user_role() to authenticated;

create policy "profiles_admin_select" on public.profiles
  for select to authenticated using (public.current_user_role() = 'admin');

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_role public.user_role := coalesce(
    nullif(new.raw_user_meta_data ->> 'role', '')::public.user_role,
    'paciente'
  );
  v_nome text := coalesce(new.raw_user_meta_data ->> 'nome', '');
begin
  insert into public.profiles (id, role, nome) values (new.id, v_role, v_nome);
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ───── 004 — nutricionistas + especialidades ────────────────────────────────
create table public.nutricionistas (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  crn text not null,
  bio text,
  slug text not null unique,
  valor_consulta_centavos integer not null default 0 check (valor_consulta_centavos >= 0),
  duracao_consulta_min integer not null default 60 check (duracao_consulta_min > 0),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index nutricionistas_profile_idx on public.nutricionistas (profile_id);
create index nutricionistas_slug_idx    on public.nutricionistas (slug);
create index nutricionistas_ativo_idx   on public.nutricionistas (ativo) where ativo;
create trigger trg_nutri_updated_at
before update on public.nutricionistas
for each row execute function public.set_updated_at();
alter table public.nutricionistas enable row level security;

create or replace function public.current_nutricionista_id()
returns uuid
language sql stable security definer set search_path = public
as $$ select id from public.nutricionistas where profile_id = (select auth.uid()) $$;
grant execute on function public.current_nutricionista_id() to authenticated;

create policy "nutri_self_all" on public.nutricionistas
  for all to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));
create policy "nutri_public_read_ativos" on public.nutricionistas
  for select to anon, authenticated using (ativo = true);

create table public.especialidades (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);
create index especialidades_slug_idx on public.especialidades (slug);
alter table public.especialidades enable row level security;
create policy "esp_public_read" on public.especialidades
  for select to anon, authenticated using (true);

insert into public.especialidades (nome, slug) values
  ('Clínica','clinica'),('Esportiva','esportiva'),('Materno-infantil','materno-infantil'),
  ('Oncológica','oncologica'),('Comportamental','comportamental'),
  ('Vegetariana e Vegana','vegetariana-e-vegana'),('Funcional','funcional')
on conflict (slug) do nothing;

create table public.nutricionista_especialidades (
  nutricionista_id uuid not null references public.nutricionistas(id) on delete cascade,
  especialidade_id uuid not null references public.especialidades(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (nutricionista_id, especialidade_id)
);
create index nutri_esp_nutri_idx on public.nutricionista_especialidades (nutricionista_id);
create index nutri_esp_esp_idx   on public.nutricionista_especialidades (especialidade_id);
alter table public.nutricionista_especialidades enable row level security;
create policy "nutri_esp_self_all" on public.nutricionista_especialidades
  for all to authenticated
  using (nutricionista_id in (select id from public.nutricionistas where profile_id = (select auth.uid())))
  with check (nutricionista_id in (select id from public.nutricionistas where profile_id = (select auth.uid())));
create policy "nutri_esp_public_read" on public.nutricionista_especialidades
  for select to anon, authenticated using (true);

-- ───── 005 — agenda (disponibilidades, agendamentos, fn_slots) ──────────────
create table public.disponibilidades (
  id uuid primary key default gen_random_uuid(),
  nutricionista_id uuid not null references public.nutricionistas(id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fim time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint disp_horario_valido check (hora_inicio < hora_fim)
);
create index disponibilidades_nutri_idx on public.disponibilidades (nutricionista_id);
create index disponibilidades_dia_idx   on public.disponibilidades (nutricionista_id, dia_semana);
create trigger trg_disp_updated_at
before update on public.disponibilidades
for each row execute function public.set_updated_at();
alter table public.disponibilidades enable row level security;
create policy "disp_nutri_all" on public.disponibilidades
  for all to authenticated
  using (nutricionista_id in (select id from public.nutricionistas where profile_id = (select auth.uid())))
  with check (nutricionista_id in (select id from public.nutricionistas where profile_id = (select auth.uid())));
create policy "disp_public_read" on public.disponibilidades
  for select to anon, authenticated using (true);

create table public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  nutricionista_id uuid not null references public.nutricionistas(id) on delete restrict,
  paciente_profile_id uuid not null references public.profiles(id) on delete restrict,
  inicio timestamptz not null,
  fim timestamptz not null,
  status public.agendamento_status not null default 'confirmado',
  daily_room_url text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agendamento_horario_valido check (inicio < fim)
);
create index agendamentos_nutri_inicio_idx on public.agendamentos (nutricionista_id, inicio);
create index agendamentos_paciente_idx     on public.agendamentos (paciente_profile_id, inicio desc);
create index agendamentos_status_idx       on public.agendamentos (status, inicio);
alter table public.agendamentos
  add constraint agendamentos_sem_sobreposicao
  exclude using gist (
    nutricionista_id with =,
    tstzrange(inicio, fim, '[)') with &&
  )
  where (status in ('confirmado','realizado'));
create trigger trg_agendamentos_updated_at
before update on public.agendamentos
for each row execute function public.set_updated_at();
alter table public.agendamentos enable row level security;
create policy "agendamentos_nutri_all" on public.agendamentos
  for all to authenticated
  using (nutricionista_id in (select id from public.nutricionistas where profile_id = (select auth.uid())))
  with check (nutricionista_id in (select id from public.nutricionistas where profile_id = (select auth.uid())));
create policy "agendamentos_paciente_select" on public.agendamentos
  for select to authenticated using (paciente_profile_id = (select auth.uid()));
create policy "agendamentos_paciente_insert" on public.agendamentos
  for insert to authenticated with check (paciente_profile_id = (select auth.uid()));
create policy "agendamentos_paciente_update_cancel" on public.agendamentos
  for update to authenticated
  using (
    paciente_profile_id = (select auth.uid())
    and status = 'confirmado'
    and inicio > (now() + interval '24 hours')
  )
  with check (paciente_profile_id = (select auth.uid()) and status = 'cancelado');

create table public.lembretes (
  id uuid primary key default gen_random_uuid(),
  agendamento_id uuid not null references public.agendamentos(id) on delete cascade,
  tipo public.lembrete_tipo not null,
  canal public.lembrete_canal not null default 'email',
  enviado_em timestamptz,
  created_at timestamptz not null default now(),
  unique (agendamento_id, tipo)
);
create index lembretes_agendamento_idx on public.lembretes (agendamento_id);
create index lembretes_pendentes_idx   on public.lembretes (tipo, enviado_em) where enviado_em is null;
alter table public.lembretes enable row level security;
revoke all on public.lembretes from anon, authenticated;

create or replace function public.fn_slots_disponiveis(
  p_nutri_id uuid, p_inicio timestamptz, p_fim timestamptz
) returns table (slot_inicio timestamptz, slot_fim timestamptz)
language plpgsql stable security definer set search_path = public
as $$
declare v_duracao_min integer;
begin
  select duracao_consulta_min into v_duracao_min from public.nutricionistas where id = p_nutri_id;
  if v_duracao_min is null then return; end if;

  return query
  with dias as (
    select gs::date as dia
    from generate_series(p_inicio::date, p_fim::date, interval '1 day') gs
  ),
  janelas as (
    select d.dia,
      ((d.dia + dp.hora_inicio) at time zone 'America/Sao_Paulo') as janela_inicio,
      ((d.dia + dp.hora_fim)    at time zone 'America/Sao_Paulo') as janela_fim
    from dias d
    join public.disponibilidades dp
      on dp.nutricionista_id = p_nutri_id
     and dp.dia_semana = extract(dow from d.dia)::smallint
  ),
  slots as (
    select gs as slot_inicio, gs + (v_duracao_min || ' minutes')::interval as slot_fim
    from janelas j,
         generate_series(j.janela_inicio,
                         j.janela_fim - (v_duracao_min || ' minutes')::interval,
                         (v_duracao_min || ' minutes')::interval) gs
  )
  select s.slot_inicio, s.slot_fim
  from slots s
  where s.slot_inicio >= greatest(p_inicio, now())
    and s.slot_fim    <= p_fim
    and not exists (
      select 1 from public.agendamentos a
      where a.nutricionista_id = p_nutri_id
        and a.status in ('confirmado','realizado')
        and tstzrange(a.inicio, a.fim, '[)') && tstzrange(s.slot_inicio, s.slot_fim, '[)')
    )
  order by s.slot_inicio;
end;
$$;
grant execute on function public.fn_slots_disponiveis(uuid, timestamptz, timestamptz) to anon, authenticated;

-- ───── 006 — clínico (prontuários, evoluções, avaliações, planos) ────────────
create table public.prontuarios (
  id uuid primary key default gen_random_uuid(),
  nutricionista_id uuid not null references public.nutricionistas(id) on delete cascade,
  paciente_profile_id uuid not null references public.profiles(id) on delete cascade,
  anamnese jsonb not null default '{}'::jsonb,
  objetivo text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (nutricionista_id, paciente_profile_id)
);
create index prontuarios_nutri_idx    on public.prontuarios (nutricionista_id);
create index prontuarios_paciente_idx on public.prontuarios (paciente_profile_id);
create trigger trg_prontuarios_updated_at before update on public.prontuarios
for each row execute function public.set_updated_at();
alter table public.prontuarios enable row level security;
create policy "prontuarios_nutri_all" on public.prontuarios
  for all to authenticated
  using (nutricionista_id in (select id from public.nutricionistas where profile_id = (select auth.uid())))
  with check (nutricionista_id in (select id from public.nutricionistas where profile_id = (select auth.uid())));
create policy "prontuarios_paciente_select" on public.prontuarios
  for select to authenticated using (paciente_profile_id = (select auth.uid()));

create table public.prontuario_evolucoes (
  id uuid primary key default gen_random_uuid(),
  prontuario_id uuid not null references public.prontuarios(id) on delete cascade,
  data timestamptz not null default now(),
  texto text not null,
  agendamento_id uuid references public.agendamentos(id) on delete set null,
  created_at timestamptz not null default now()
);
create index prontuario_evolucoes_prontuario_data_idx on public.prontuario_evolucoes (prontuario_id, data desc);
alter table public.prontuario_evolucoes enable row level security;
create policy "evolucoes_via_prontuario_nutri" on public.prontuario_evolucoes
  for all to authenticated
  using (prontuario_id in (
    select pr.id from public.prontuarios pr
    join public.nutricionistas n on n.id = pr.nutricionista_id
    where n.profile_id = (select auth.uid())
  ))
  with check (prontuario_id in (
    select pr.id from public.prontuarios pr
    join public.nutricionistas n on n.id = pr.nutricionista_id
    where n.profile_id = (select auth.uid())
  ));
create policy "evolucoes_via_prontuario_paciente_select" on public.prontuario_evolucoes
  for select to authenticated
  using (prontuario_id in (select id from public.prontuarios where paciente_profile_id = (select auth.uid())));

create table public.avaliacoes_antropometricas (
  id uuid primary key default gen_random_uuid(),
  prontuario_id uuid not null references public.prontuarios(id) on delete cascade,
  data date not null default current_date,
  peso_kg numeric(6,2),
  altura_cm numeric(6,2),
  circunferencias jsonb not null default '{}'::jsonb,
  percentual_gordura numeric(5,2),
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index avaliacoes_prontuario_data_idx on public.avaliacoes_antropometricas (prontuario_id, data desc);
create trigger trg_avaliacoes_updated_at before update on public.avaliacoes_antropometricas
for each row execute function public.set_updated_at();
alter table public.avaliacoes_antropometricas enable row level security;
create policy "avaliacoes_via_prontuario_nutri" on public.avaliacoes_antropometricas
  for all to authenticated
  using (prontuario_id in (
    select pr.id from public.prontuarios pr
    join public.nutricionistas n on n.id = pr.nutricionista_id
    where n.profile_id = (select auth.uid())
  ))
  with check (prontuario_id in (
    select pr.id from public.prontuarios pr
    join public.nutricionistas n on n.id = pr.nutricionista_id
    where n.profile_id = (select auth.uid())
  ));
create policy "avaliacoes_via_prontuario_paciente_select" on public.avaliacoes_antropometricas
  for select to authenticated
  using (prontuario_id in (select id from public.prontuarios where paciente_profile_id = (select auth.uid())));

create table public.planos_alimentares (
  id uuid primary key default gen_random_uuid(),
  prontuario_id uuid not null references public.prontuarios(id) on delete cascade,
  titulo text not null,
  data_inicio date not null default current_date,
  data_fim date,
  observacoes text,
  publicado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index planos_prontuario_idx on public.planos_alimentares (prontuario_id);
create index planos_publicado_idx  on public.planos_alimentares (prontuario_id, publicado);
create trigger trg_planos_updated_at before update on public.planos_alimentares
for each row execute function public.set_updated_at();
alter table public.planos_alimentares enable row level security;
create policy "planos_via_prontuario_nutri" on public.planos_alimentares
  for all to authenticated
  using (prontuario_id in (
    select pr.id from public.prontuarios pr
    join public.nutricionistas n on n.id = pr.nutricionista_id
    where n.profile_id = (select auth.uid())
  ))
  with check (prontuario_id in (
    select pr.id from public.prontuarios pr
    join public.nutricionistas n on n.id = pr.nutricionista_id
    where n.profile_id = (select auth.uid())
  ));
create policy "planos_paciente_select_publicado" on public.planos_alimentares
  for select to authenticated
  using (publicado = true and prontuario_id in (
    select id from public.prontuarios where paciente_profile_id = (select auth.uid())
  ));

create table public.plano_refeicoes (
  id uuid primary key default gen_random_uuid(),
  plano_id uuid not null references public.planos_alimentares(id) on delete cascade,
  nome text not null,
  horario time,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index plano_refeicoes_plano_ordem_idx on public.plano_refeicoes (plano_id, ordem);
create trigger trg_refeicoes_updated_at before update on public.plano_refeicoes
for each row execute function public.set_updated_at();
alter table public.plano_refeicoes enable row level security;
create policy "refeicoes_via_plano_nutri" on public.plano_refeicoes
  for all to authenticated
  using (plano_id in (
    select p.id from public.planos_alimentares p
    join public.prontuarios pr on pr.id = p.prontuario_id
    join public.nutricionistas n on n.id = pr.nutricionista_id
    where n.profile_id = (select auth.uid())
  ))
  with check (plano_id in (
    select p.id from public.planos_alimentares p
    join public.prontuarios pr on pr.id = p.prontuario_id
    join public.nutricionistas n on n.id = pr.nutricionista_id
    where n.profile_id = (select auth.uid())
  ));
create policy "refeicoes_via_plano_paciente_select" on public.plano_refeicoes
  for select to authenticated
  using (plano_id in (
    select p.id from public.planos_alimentares p
    join public.prontuarios pr on pr.id = p.prontuario_id
    where p.publicado = true and pr.paciente_profile_id = (select auth.uid())
  ));

-- ───── 007 — alimentos (TACO) + itens + totais ──────────────────────────────
create table public.alimentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text,
  kcal_por_100g numeric(8,2) not null default 0,
  carboidrato_g numeric(7,2) not null default 0,
  proteina_g numeric(7,2) not null default 0,
  lipidio_g numeric(7,2) not null default 0,
  fibra_g numeric(7,2) not null default 0,
  fonte text not null default 'TACO',
  created_at timestamptz not null default now()
);
create index alimentos_nome_trgm_idx on public.alimentos using gin (nome extensions.gin_trgm_ops);
create index alimentos_categoria_idx on public.alimentos (categoria);
alter table public.alimentos enable row level security;
create policy "alimentos_public_read" on public.alimentos
  for select to anon, authenticated using (true);

create table public.plano_itens (
  id uuid primary key default gen_random_uuid(),
  refeicao_id uuid not null references public.plano_refeicoes(id) on delete cascade,
  alimento_id uuid not null references public.alimentos(id) on delete restrict,
  quantidade_g numeric(8,2) not null check (quantidade_g > 0),
  medida_caseira text,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index plano_itens_refeicao_idx on public.plano_itens (refeicao_id, ordem);
create index plano_itens_alimento_idx on public.plano_itens (alimento_id);
create trigger trg_plano_itens_updated_at before update on public.plano_itens
for each row execute function public.set_updated_at();
alter table public.plano_itens enable row level security;
create policy "itens_via_refeicao_nutri" on public.plano_itens
  for all to authenticated
  using (refeicao_id in (
    select r.id from public.plano_refeicoes r
    join public.planos_alimentares p on p.id = r.plano_id
    join public.prontuarios pr on pr.id = p.prontuario_id
    join public.nutricionistas n on n.id = pr.nutricionista_id
    where n.profile_id = (select auth.uid())
  ))
  with check (refeicao_id in (
    select r.id from public.plano_refeicoes r
    join public.planos_alimentares p on p.id = r.plano_id
    join public.prontuarios pr on pr.id = p.prontuario_id
    join public.nutricionistas n on n.id = pr.nutricionista_id
    where n.profile_id = (select auth.uid())
  ));
create policy "itens_via_refeicao_paciente_select" on public.plano_itens
  for select to authenticated
  using (refeicao_id in (
    select r.id from public.plano_refeicoes r
    join public.planos_alimentares p on p.id = r.plano_id
    join public.prontuarios pr on pr.id = p.prontuario_id
    where p.publicado = true and pr.paciente_profile_id = (select auth.uid())
  ));

create or replace function public.fn_refeicao_totais(p_refeicao_id uuid)
returns table (kcal numeric, carboidrato_g numeric, proteina_g numeric, lipidio_g numeric, fibra_g numeric)
language sql stable security invoker set search_path = public
as $$
  select
    coalesce(sum(a.kcal_por_100g * i.quantidade_g / 100.0), 0),
    coalesce(sum(a.carboidrato_g  * i.quantidade_g / 100.0), 0),
    coalesce(sum(a.proteina_g     * i.quantidade_g / 100.0), 0),
    coalesce(sum(a.lipidio_g      * i.quantidade_g / 100.0), 0),
    coalesce(sum(a.fibra_g        * i.quantidade_g / 100.0), 0)
  from public.plano_itens i
  join public.alimentos a on a.id = i.alimento_id
  where i.refeicao_id = p_refeicao_id
$$;
grant execute on function public.fn_refeicao_totais(uuid) to authenticated;

create or replace function public.fn_plano_totais(p_plano_id uuid)
returns table (kcal numeric, carboidrato_g numeric, proteina_g numeric, lipidio_g numeric, fibra_g numeric)
language sql stable security invoker set search_path = public
as $$
  select
    coalesce(sum(a.kcal_por_100g * i.quantidade_g / 100.0), 0),
    coalesce(sum(a.carboidrato_g  * i.quantidade_g / 100.0), 0),
    coalesce(sum(a.proteina_g     * i.quantidade_g / 100.0), 0),
    coalesce(sum(a.lipidio_g      * i.quantidade_g / 100.0), 0),
    coalesce(sum(a.fibra_g        * i.quantidade_g / 100.0), 0)
  from public.plano_itens i
  join public.plano_refeicoes r on r.id = i.refeicao_id
  join public.alimentos a on a.id = i.alimento_id
  where r.plano_id = p_plano_id
$$;
grant execute on function public.fn_plano_totais(uuid) to authenticated;

-- ───── 008 — assinaturas/pagamentos schema-only (§3.1) ──────────────────────
create table public.assinaturas (
  id uuid primary key default gen_random_uuid(),
  nutricionista_id uuid not null references public.nutricionistas(id) on delete cascade,
  abacatepay_subscription_id text,
  ciclo public.assinatura_ciclo not null default 'MONTHLY',
  status public.assinatura_status not null default 'ativa',
  proxima_cobranca timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index assinaturas_nutri_idx  on public.assinaturas (nutricionista_id);
create index assinaturas_status_idx on public.assinaturas (status);
create trigger trg_assinaturas_updated_at before update on public.assinaturas
for each row execute function public.set_updated_at();
alter table public.assinaturas enable row level security;
create policy "assinaturas_nutri_select" on public.assinaturas
  for select to authenticated
  using (nutricionista_id in (select id from public.nutricionistas where profile_id = (select auth.uid())));

create table public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  assinatura_id uuid not null references public.assinaturas(id) on delete cascade,
  abacatepay_id text,
  status text,
  valor_centavos integer not null check (valor_centavos >= 0),
  metodo public.pagamento_metodo,
  pago_em timestamptz,
  created_at timestamptz not null default now()
);
create index pagamentos_assinatura_idx on public.pagamentos (assinatura_id, created_at desc);
alter table public.pagamentos enable row level security;
create policy "pagamentos_via_assinatura_nutri_select" on public.pagamentos
  for select to authenticated
  using (assinatura_id in (
    select a.id from public.assinaturas a
    join public.nutricionistas n on n.id = a.nutricionista_id
    where n.profile_id = (select auth.uid())
  ));

-- ───── 009 — funções admin + retenção 90d ───────────────────────────────────
create or replace function public.fn_admin_top_queries(p_limit integer default 20)
returns table (query text, calls bigint, total_exec_time_ms double precision, mean_exec_time_ms double precision, rows bigint)
language sql stable security definer set search_path = public, extensions
as $$
  select substring(query for 200), calls, total_exec_time, mean_exec_time, rows
  from extensions.pg_stat_statements
  where public.current_user_role() = 'admin'
  order by total_exec_time desc
  limit p_limit
$$;
revoke execute on function public.fn_admin_top_queries(integer) from public, anon;
grant execute on function public.fn_admin_top_queries(integer) to authenticated;

create or replace function public.fn_admin_ultimas_execucoes_jobs(p_limit integer default 50)
returns setof public.execucoes_jobs
language sql stable security definer set search_path = public
as $$
  select * from public.execucoes_jobs
  where public.current_user_role() = 'admin'
  order by iniciado_em desc limit p_limit
$$;
revoke execute on function public.fn_admin_ultimas_execucoes_jobs(integer) from public, anon;
grant execute on function public.fn_admin_ultimas_execucoes_jobs(integer) to authenticated;

create or replace function public.fn_admin_eventos_recentes(
  p_severidade public.evento_severidade default 'erro',
  p_limit integer default 100
) returns setof public.eventos_sistema
language sql stable security definer set search_path = public
as $$
  select * from public.eventos_sistema
  where public.current_user_role() = 'admin' and severidade = p_severidade
  order by created_at desc limit p_limit
$$;
revoke execute on function public.fn_admin_eventos_recentes(public.evento_severidade, integer) from public, anon;
grant execute on function public.fn_admin_eventos_recentes(public.evento_severidade, integer) to authenticated;

create or replace function public.fn_limpar_eventos_antigos()
returns table (removidos bigint)
language plpgsql security definer set search_path = public
as $$
declare v_count bigint;
begin
  delete from public.eventos_sistema where created_at < now() - interval '90 days';
  get diagnostics v_count = row_count;
  delete from public.execucoes_jobs where iniciado_em < now() - interval '90 days';
  return query select v_count;
end;
$$;
revoke execute on function public.fn_limpar_eventos_antigos() from public, anon, authenticated;

do $$
begin
  perform cron.schedule(
    'limpar_eventos_antigos_diario',
    '0 3 * * *',
    $cron$ select public.fn_limpar_eventos_antigos(); $cron$
  );
exception when others then null;
end$$;
