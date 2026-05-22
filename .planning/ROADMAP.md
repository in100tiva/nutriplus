# Roadmap — MVP (estado)

Fases sequenciais da spec. Atualizado em 2026-05-22. Ver [SPEC.md](SPEC.md).

## Fase 0 — Fundação ✅

- [x] Migrations base: `profiles`, `nutricionistas`, `especialidades`,
      `nutricionista_especialidades`, `eventos_sistema`, `execucoes_jobs`,
      `assinaturas` (schema-only), `pagamentos` (schema-only).
- [x] `pg_stat_statements`, `pg_trgm`, `btree_gist`, `pg_cron` instalados.
- [x] Toda FK / coluna RLS com índice na migration de criação (§9.2).
- [x] Trigger `handle_new_user` em `auth.users` → cria `profiles`.
- [x] RLS habilitada em todas as tabelas com políticas conforme spec.
- [x] Tipos TS gerados via Supabase MCP em `src/types/database.ts`.
- [x] Helpers `src/lib/observability.ts` (frontend) e
      `supabase/functions/_shared/log.ts` (Edge Functions).
- [x] Funções admin `/admin/saude`: `fn_admin_top_queries`,
      `fn_admin_ultimas_execucoes_jobs`, `fn_admin_eventos_recentes`.
- [x] Job `cron.schedule('limpar_eventos_antigos_diario')` (retenção 90d, §9.6).
- [x] Hardening de segurança aplicado (revoke execute, search_path fixo).

## Fase 1 — Agenda ✅

- [x] F1: cadastro/perfil nutri com CRN, slug único, valor, duração, `ativo`.
- [x] F2: `disponibilidades`, `agendamentos`, `fn_slots_disponiveis(uuid, ts, ts)`
      (função SQL nomeada — §6.F2, §9.2).
- [x] Exclusion constraint `agendamentos_sem_sobreposicao` (defesa em profundidade).
- [x] Política RLS de cancelamento com janela de 24h.
- [x] Telas: `/cadastro`, `/login`, `/app/perfil`, `/app/agenda`,
      pública `/nutri/:slug`.
- [x] Agendamento nasce `confirmado` (sem etapa de pagamento — §3.1).

## Fase 2 — Teleconsulta ✅

- [x] Edge Function `criar-sala-daily` (deploy v1) com `comLog`, integração com
      API do Daily (fallback em mock quando `DAILY_API_KEY` ausente).
- [x] Registro de `sala_daily_criada` / `sala_daily_falha` em `eventos_sistema`.
- [x] Componente embed Daily em `/app/consulta/:id` e `/paciente/consulta/:id`.
- [x] Botão "Entrar" aparece 10 min antes (cálculo no cliente, sem polling).

## Fase 3 — Miolo clínico ✅

- [x] F6: `prontuarios` (1 por nutri↔paciente), `prontuario_evolucoes`
      datadas, anamnese jsonb com seções (histórico, rotina, restrições, alergias,
      medicamentos).
- [x] F8: tabela `alimentos` com seed TACO mínimo (33 itens cobrindo as
      categorias principais). Índice GIN trgm em `nome`.
- [x] F7: criador de plano em `/app/planos` + editor `/app/planos/:id`.
      `plano_refeicoes` ordenadas, `plano_itens` com busca por trigrama.
      Cálculo de kcal/macros via `fn_refeicao_totais` e `fn_plano_totais`
      (funções SQL nomeadas SECURITY INVOKER; RLS resolve isolamento).
- [x] Gate `publicado` para visibilidade ao paciente.

## Fase 4 — Retenção e paciente ✅

- [x] F9: `avaliacoes_antropometricas` com índice composto `(prontuario_id, data)`,
      sparkline SVG na área do paciente (`/paciente/evolucao`).
- [x] F5: telas `/paciente/agendamentos`, `/paciente/plano`,
      `/paciente/evolucao`. Cancelamento gated por janela ≥24h (frontend +
      política RLS de defesa em profundidade).
- [x] F10: Edge Function `enviar-lembretes` (deploy v1, `verify_jwt:false`)
      varre confirmados, marca `lembretes.enviado_em`, grava em
      `execucoes_jobs`. Agendada via `pg_cron` (`*/15 * * * *`) + `pg_net`.
      Provider de e-mail real (Resend/SES) é TODO claro no código.
- [x] Tela `/admin/saude` consolidando baseline (§9.4): top queries do
      `pg_stat_statements`, últimas execuções de cron, eventos com severidade
      `erro`.

## Decisões em aberto (§13 da spec)

Respondidas autonomamente conforme defaults da spec:

| # | Pergunta | Resposta |
|---|----------|----------|
| 1 | Janela mínima de cancelamento | **24h** |
| 2 | Autocadastro paciente | **livre** |
| 3 | Retenção de `eventos_sistema`/logs | **90 dias** |
| 4 | Alerta de falha do cron | Severidade `erro` em `eventos_sistema` + tela `/admin/saude` (provider de e-mail vira fase futura junto com lembretes reais) |

## Não construído (fora do escopo, intencional)

- **F3 — Pagamento via AbacatePay** (§3.1). Tabelas `assinaturas` e `pagamentos`
  presentes com RLS, sem lógica. Quando ligar a cobrança, criar a Edge Function
  `abacatepay-webhook` e usar `assinaturas.status` como gate de `ativo`.
- Vitrine pública `/nutri/busca` por especialidade. Schema já preparado.
- Tracing distribuído com APM dedicado.
- App nativo, chat assíncrono, geração de plano por IA, templates de plano.
