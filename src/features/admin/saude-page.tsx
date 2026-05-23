import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, Loading, Badge } from '@/components/ui'
import { Bar } from '@/components/charts'
import { IconDownload, IconCheck } from '@/components/icons'
import { formatDataHora } from '@/lib/format'

interface Query {
  query: string
  calls: number
  total_exec_time_ms: number
  mean_exec_time_ms: number
  rows: number
}

interface Job {
  id: string
  job_nome: string
  iniciado_em: string
  finalizado_em: string | null
  status: string
  itens_processados: number
  itens_falha: number
}

interface Evento {
  id: string
  tipo: string
  request_id: string | null
  payload: unknown
  severidade: string
  created_at: string
}

export function AdminSaudePage() {
  const { data: topQueries, isLoading: lq } = useQuery({
    queryKey: ['admin-top-queries'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('fn_admin_top_queries', { p_limit: 15 })
      if (error) throw error
      return (data ?? []) as Query[]
    },
  })
  const { data: jobs, isLoading: lj } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('fn_admin_ultimas_execucoes_jobs', { p_limit: 20 })
      if (error) throw error
      return (data ?? []) as Job[]
    },
  })
  const { data: erros, isLoading: le } = useQuery({
    queryKey: ['admin-erros'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('fn_admin_eventos_recentes', {
        p_severidade: 'erro',
        p_limit: 50,
      })
      if (error) throw error
      return (data ?? []) as Evento[]
    },
  })

  const totalMs = (topQueries ?? []).reduce((s, q) => s + Number(q.total_exec_time_ms), 0)

  return (
    <div className="fade-up" data-screen-label="admin-saude">
      <div className="page-head">
        <div>
          <div className="eyebrow">/admin/saude</div>
          <h1>Saúde operacional</h1>
          <p className="sub">
            Baseline da §9.4 — quatro métricas observáveis enquanto o tráfego é pequeno,
            para que a hora de escalar seja decisão de planilha e não de pânico.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Badge size="md">
            <span className="dot-ok" /> Supabase · sa-east-1
          </Badge>
          <button type="button" className="btn">
            <IconDownload /> Snapshot
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
          gap: 16,
        }}
      >
        {/* pg_stat_statements */}
        <Card variant="flush">
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '0.5px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3 className="serif" style={{ fontSize: 18, fontWeight: 500 }}>
                Top queries · pg_stat_statements
              </h3>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                Acumulado · ordenado por tempo total
              </div>
            </div>
            <Badge>{totalMs.toFixed(0)} ms agregados</Badge>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 80px 70px 70px',
              gap: 12,
              padding: '10px 20px',
              fontSize: 10.5,
              color: 'var(--ink-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
              borderBottom: '0.5px solid var(--line-2)',
            }}
          >
            <div>Query</div>
            <div style={{ textAlign: 'right' }}>Chamadas</div>
            <div style={{ textAlign: 'right' }}>Total</div>
            <div style={{ textAlign: 'right' }}>Média</div>
          </div>
          {lq ? (
            <Loading />
          ) : (
            (topQueries ?? []).map((q, i) => {
              const pct = totalMs > 0 ? Number(q.total_exec_time_ms) / totalMs : 0
              return (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 80px 70px 70px',
                    gap: 12,
                    padding: '11px 20px',
                    alignItems: 'center',
                    borderBottom: i < (topQueries?.length ?? 0) - 1 ? '0.5px solid var(--line-2)' : 0,
                    fontSize: 12.5,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      className="mono"
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: 11.5,
                        color: 'var(--ink-2)',
                      }}
                    >
                      {q.query}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <Bar value={pct} max={1} h={4} />
                    </div>
                  </div>
                  <div className="tnum" style={{ textAlign: 'right', color: 'var(--ink-2)' }}>
                    {Number(q.calls).toLocaleString('pt-BR')}
                  </div>
                  <div className="tnum" style={{ textAlign: 'right', color: 'var(--ink-2)' }}>
                    {Number(q.total_exec_time_ms).toFixed(0)} ms
                  </div>
                  <div className="tnum" style={{ textAlign: 'right', color: 'var(--ink-2)' }}>
                    {Number(q.mean_exec_time_ms).toFixed(1)} ms
                  </div>
                </div>
              )
            })
          )}
          <div
            style={{
              padding: '12px 20px',
              background: 'var(--paper-2)',
              fontSize: 12,
              color: 'var(--ink-2)',
              lineHeight: 1.55,
            }}
          >
            <strong>Regra:</strong> escalar plano só quando CPU sustentada &gt; 70% <em>e</em> nenhuma query
            única passar de 30% da CPU.
          </div>
        </Card>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card variant="flush">
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '0.5px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 className="serif" style={{ fontSize: 17, fontWeight: 500 }}>
                execucoes_jobs
              </h3>
              <Badge variant="accent">
                <IconCheck /> cron OK
              </Badge>
            </div>
            {lj ? (
              <Loading />
            ) : (jobs ?? []).length === 0 ? (
              <div style={{ padding: 16, color: 'var(--ink-3)', fontSize: 13 }}>
                Sem execuções registradas.
              </div>
            ) : (
              (jobs ?? []).map((j, i) => (
                <div
                  key={j.id}
                  style={{
                    padding: '10px 20px',
                    borderBottom: i < (jobs ?? []).length - 1 ? '0.5px solid var(--line-2)' : 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 12.5,
                  }}
                >
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      flex: 'none',
                      background:
                        j.status === 'ok'
                          ? 'var(--accent-2)'
                          : j.status === 'parcial'
                            ? 'var(--warn)'
                            : 'var(--danger)',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      className="mono"
                      style={{
                        fontSize: 11.5,
                        color: 'var(--ink-2)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {j.job_nome}
                    </div>
                    <div className="muted tnum" style={{ fontSize: 10.5, marginTop: 1 }}>
                      {formatDataHora(j.iniciado_em)}
                    </div>
                  </div>
                  <div className="tnum" style={{ textAlign: 'right', fontSize: 11.5 }}>
                    <span style={{ color: 'var(--ink-2)' }}>{j.itens_processados}</span>
                    {j.itens_falha > 0 && (
                      <span style={{ color: 'var(--warn)', marginLeft: 4 }}>
                        · {j.itens_falha} ⚠
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </Card>

          <Card variant="flush">
            <div style={{ padding: '14px 20px', borderBottom: '0.5px solid var(--line)' }}>
              <h3 className="serif" style={{ fontSize: 17, fontWeight: 500 }}>
                eventos_sistema
              </h3>
              <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>
                retenção 90 dias · sem PII
              </div>
            </div>
            {le ? (
              <Loading />
            ) : (erros ?? []).length === 0 ? (
              <div style={{ padding: 16, color: 'var(--ink-3)', fontSize: 13 }}>
                Sem erros recentes — bom sinal.
              </div>
            ) : (
              (erros ?? []).map((e, i) => (
                <div
                  key={e.id}
                  style={{
                    padding: '10px 20px',
                    borderBottom: i < (erros ?? []).length - 1 ? '0.5px solid var(--line-2)' : 0,
                    fontSize: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Badge variant="warn">{e.tipo}</Badge>
                    <span
                      className="mono tnum muted-2"
                      style={{ fontSize: 10.5, marginLeft: 'auto' }}
                    >
                      {formatDataHora(e.created_at)}
                    </span>
                  </div>
                  <div
                    className="mono"
                    style={{ fontSize: 11.5, color: 'var(--ink-2)', marginTop: 4 }}
                  >
                    <span style={{ color: 'var(--ink-4)' }}>
                      request_id={e.request_id ?? '—'}
                    </span>
                  </div>
                  <pre
                    style={{
                      marginTop: 4,
                      padding: 8,
                      background: 'var(--paper-2)',
                      borderRadius: 6,
                      fontSize: 11,
                      color: 'var(--ink-2)',
                      overflow: 'auto',
                      maxHeight: 120,
                    }}
                  >
                    {JSON.stringify(e.payload, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
