# Spec — Consultório Digital para Nutricionistas (MVP)

Versão 1.2 da spec do produto. Documento de referência durante toda a refatoração.

## Resumo

Marketplace de duas pontas para nutricionistas. **Este MVP** entrega só o lado do
profissional ("escritório virtual") + interação nutri↔paciente. Vitrine pública por
especialidade e **cobrança ficam fora de escopo**, mas o schema nasce preparado para
ambas.

## Decisões autônomas tomadas (de §13)

- **Q1 — Janela de cancelamento:** 24h (sugestão da spec).
- **Q2 — Autocadastro paciente:** livre (sem convite obrigatório).
- **Q3 — Retenção de `eventos_sistema`/logs:** 90 dias.
- **Q4 — Alerta de falha de cron:** registro com severidade `erro` em
  `eventos_sistema` + visível na tela `/admin/saude`. (E-mail é fase futura — não há
  provider configurado no MVP além do que o Supabase já provê para auth.)

## Stack

- Frontend: React + Vite + TS + shadcn/Tailwind + React Router v6 + TanStack Query +
  React Hook Form + Zod.
- Backend: Supabase (Postgres, Auth, Storage, RLS, Realtime, Edge Functions).
- Vídeo: Daily.co (embed).
- Pagamento: **DESLIGADO no MVP** — schema preparado para AbacatePay (§3.1).
- Observabilidade: nativos do Supabase (`pg_stat_statements`, Logs Explorer, Reports)
  + tabelas `eventos_sistema` e `execucoes_jobs` + `request_id` de correlação. **Sem APM
  externo.**

## Modelo de dados (§5)

Tabelas (todas com `id uuid pk default gen_random_uuid()`, `created_at`, `updated_at`):

| Tabela | Papel | RLS | Índices críticos |
|--------|-------|-----|------------------|
| profiles | estende auth.users (role/nome/telefone/avatar_url) | sim | (user_id) |
| nutricionistas | perfil profissional (crn, bio, slug único, valor, duração, ativo) | sim | (profile_id), (slug) |
| especialidades | tabela de domínio | público leitura | (slug) |
| nutricionista_especialidades | N:N | sim | (nutri,esp) |
| disponibilidades | janelas recorrentes (dia_semana, hora_inicio, hora_fim) | sim | (nutricionista_id) |
| agendamentos | inicio, fim, status, daily_room_url | sim | **(nutricionista_id, inicio)** |
| prontuarios | 1 por (nutri, paciente), anamnese jsonb, objetivo, observacoes | sim | (nutricionista_id), (paciente_profile_id) |
| avaliacoes_antropometricas | peso, altura, circunferencias jsonb, %gordura | sim | **(prontuario_id, data)** |
| planos_alimentares | titulo, datas, observacoes, publicado | sim | (prontuario_id) |
| plano_refeicoes | nome, horario, ordem | sim | (plano_id) |
| plano_itens | alimento_id, quantidade_g, medida_caseira | sim | (refeicao_id) |
| alimentos | TACO (kcal, macros, fibra) | público leitura | (nome trgm) |
| lembretes | tipo (24h/1h), canal email, enviado_em | sim | (agendamento_id) |
| eventos_sistema | append-only (tipo, request_id, payload, severidade) | admin/service | (tipo), (severidade, created_at) |
| execucoes_jobs | execuções de cron (job_nome, status, itens) | admin/service | (job_nome, iniciado_em desc) |
| assinaturas / pagamentos | **schema-only no MVP** | sim | n/a |

## Funcionalidades do MVP (§6)

- **F1** Cadastro/perfil nutri (CRN, slug, valor, duração, `ativo=true`).
- **F2** Agenda + autoagendamento → `fn_slots_disponiveis(nutri_id, intervalo)` nomeada.
  Agendamento nasce `confirmado` (sem etapa de pagamento). Listas **sem
  `count:'exact'`**.
- **F3** PAGAMENTO — FORA DE ESCOPO (reservado para fase futura via AbacatePay).
- **F4** Teleconsulta — Edge Function `criar-sala-daily` cria sala via Daily;
  `daily_room_url` salvo no agendamento; botão "Entrar" 10min antes calculado no
  cliente.
- **F5** Área paciente (agendamentos, plano, evolução, cancelamento ≥24h).
- **F6** Prontuário 1-por-relação, anamnese jsonb, evolução datada.
- **F7** Criador de planos: refeições ordenadas com itens; kcal/macros calculados.
  `publicado` controla visibilidade ao paciente.
- **F8** Banco TACO via seed; busca por nome.
- **F9** Antropometria + gráfico evolução (usa índice composto).
- **F10** Lembretes via Edge Function + pg_cron; grava em `execucoes_jobs`.

## Rotas (§7)

- Públicas: `/`, `/login`, `/cadastro`, `/nutri/:slug`.
- Nutri (`/app/*`): agenda, pacientes (lista + detalhe), consulta/:id, planos, perfil.
- Paciente (`/paciente/*`): agendamentos, consulta/:id, plano, evolucao.
- Admin: `/admin/saude` (baseline operacional).

## Segurança/LGPD (§8)

- RLS obrigatório; políticas conforme nutri/paciente/admin.
- Toda FK/coluna de filtro RLS com **índice na migration de criação**.
- `eventos_sistema.payload` **nunca** carrega PII ou dado clínico — só identificadores
  e metadados operacionais.
- Storage de anexos em bucket privado com URLs assinadas curtas.
- Segredos só em env das Edge Functions.

## Observabilidade (§9)

- `pg_stat_statements` ON desde a Fase 0.
- Helper de log estruturado JSON em todas as Edge Functions (nome, `duracao_ms`,
  status, `request_id`, id de recurso).
- `request_id` gerado na SPA e propagado por toda a cadeia.
- Tabela `/admin/saude`: top queries + últimas execuções de cron + eventos com
  severidade `erro`.
- Limiares de escala registrados (CPU >70% sustentado **e** nenhuma query única >30%
  da CPU para escalar plano; p95 >400ms sustentado para materializar leitura;
  pg_stat_statements para reduzir frequência de chamada).

## Convenções (§12)

- TS estrito (`strict: true`); sem `any`.
- Tipos do banco gerados via Supabase CLI/MCP.
- Zod como fonte única de validação.
- Edge Functions com responsabilidade única.
- Leituras compostas via **funções SQL nomeadas (RPC)**, nunca queries anônimas.
- Toda função SQL nova validada com `EXPLAIN ANALYZE` sobre seed realista.
- Seed inclui nutri "pesado" (vários pacientes + agendamentos + avaliações).
- Não usar `count:'exact'` no PostgREST.
- Migrations versionadas; sem alteração manual em produção.
- Tratar loading/vazio/erro em todas as telas.
