// Observabilidade no frontend (§9.3 da spec).
// Gera um request_id estável por fluxo de UI e expõe um logger estruturado
// que será enviado, futuramente, para o Logs Explorer via Edge Functions.

const RID_KEY = 'nutri.request_id'

function uuidLike(): string {
  // Não precisamos de RFC4122 — só queremos algo legível e único o bastante
  // para correlacionar uma cadeia frontend → DB → Edge Function.
  const rand = () => Math.random().toString(36).slice(2, 10)
  return `${rand()}-${rand()}-${Date.now().toString(36)}`
}

/**
 * Retorna um request_id estável para o fluxo atual (escopo: aba/sessionStorage).
 * Crie um novo quando começar um fluxo novo de UI via `newRequestId()`.
 */
export function getRequestId(): string {
  if (typeof window === 'undefined') return uuidLike()
  let rid = window.sessionStorage.getItem(RID_KEY)
  if (!rid) {
    rid = uuidLike()
    window.sessionStorage.setItem(RID_KEY, rid)
  }
  return rid
}

/** Rotaciona o request_id. Use ao iniciar fluxos longos (cadastro, agendamento). */
export function newRequestId(): string {
  const rid = uuidLike()
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(RID_KEY, rid)
  }
  return rid
}

type LogLevel = 'info' | 'aviso' | 'erro'

interface LogEvent {
  tipo: string
  severidade?: LogLevel
  entidade?: string
  entidade_id?: string
  duracao_ms?: number
  request_id?: string
  payload?: Record<string, unknown>
}

/**
 * Log estruturado no console — formato JSON único por evento, fácil de varrer.
 * Em produção a expectativa é encaminhar via Edge Function para o Logs Explorer.
 */
export function log(evt: LogEvent): void {
  const entry = {
    ts: new Date().toISOString(),
    severidade: evt.severidade ?? 'info',
    tipo: evt.tipo,
    request_id: evt.request_id ?? getRequestId(),
    entidade: evt.entidade,
    entidade_id: evt.entidade_id,
    duracao_ms: evt.duracao_ms,
    payload: evt.payload,
  }
  const line = JSON.stringify(entry)
  if (evt.severidade === 'erro') {
    console.error(line)
  } else if (evt.severidade === 'aviso') {
    console.warn(line)
  } else {
    console.info(line)
  }
}

/** Mede uma promessa e registra `duracao_ms` automaticamente. */
export async function timed<T>(
  tipo: string,
  fn: () => Promise<T>,
  extra?: Omit<LogEvent, 'tipo' | 'duracao_ms'>,
): Promise<T> {
  const t0 = performance.now()
  try {
    const out = await fn()
    log({ ...extra, tipo, duracao_ms: Math.round(performance.now() - t0) })
    return out
  } catch (err) {
    log({
      ...extra,
      tipo,
      severidade: 'erro',
      duracao_ms: Math.round(performance.now() - t0),
      payload: { ...extra?.payload, mensagem: (err as Error).message },
    })
    throw err
  }
}
