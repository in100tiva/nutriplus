// Helper compartilhado de logging estruturado para Edge Functions (§9.3 da spec).
// Cada log é uma linha JSON com nome, duracao_ms, status, id de recurso e request_id —
// formato consumível pelo Logs Explorer do Supabase sem nenhuma infra extra.

type Severidade = 'info' | 'aviso' | 'erro'

export interface LogEntrada {
  fn: string
  request_id?: string | null
  duracao_ms?: number
  status?: 'ok' | 'erro' | 'parcial'
  entidade?: string
  entidade_id?: string | null
  payload?: Record<string, unknown>
  severidade?: Severidade
}

export function log(entrada: LogEntrada): void {
  const linha = JSON.stringify({
    ts: new Date().toISOString(),
    severidade: entrada.severidade ?? 'info',
    ...entrada,
  })
  if (entrada.severidade === 'erro') {
    console.error(linha)
  } else if (entrada.severidade === 'aviso') {
    console.warn(linha)
  } else {
    console.log(linha)
  }
}

/**
 * Executa `fn`, mede a duração, garante log estruturado de sucesso/erro
 * e devolve o resultado (ou propaga o erro).
 */
export async function comLog<T>(
  meta: Omit<LogEntrada, 'duracao_ms' | 'status'>,
  fn: () => Promise<T>,
): Promise<T> {
  const t0 = performance.now()
  try {
    const out = await fn()
    log({ ...meta, status: 'ok', duracao_ms: Math.round(performance.now() - t0) })
    return out
  } catch (err) {
    log({
      ...meta,
      status: 'erro',
      severidade: 'erro',
      duracao_ms: Math.round(performance.now() - t0),
      payload: { ...meta.payload, mensagem: (err as Error).message },
    })
    throw err
  }
}

/**
 * Extrai o request_id do header `x-request-id` se vier do frontend; gera fallback.
 */
export function obterRequestId(req: Request): string {
  return (
    req.headers.get('x-request-id') ??
    `${crypto.randomUUID().slice(0, 8)}-edge`
  )
}
