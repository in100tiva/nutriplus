import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Loading,
  Badge,
} from '@/components/ui'
import { formatDataHora } from '@/lib/format'

export function AdminSaudePage() {
  const { data: topQueries, isLoading: lq } = useQuery({
    queryKey: ['admin-top-queries'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('fn_admin_top_queries', { p_limit: 15 })
      if (error) throw error
      return data ?? []
    },
  })

  const { data: jobs, isLoading: lj } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('fn_admin_ultimas_execucoes_jobs', { p_limit: 20 })
      if (error) throw error
      return data ?? []
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
      return data ?? []
    },
  })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Saúde do sistema</h2>
      <p className="text-sm text-gray-600">
        Baseline operacional (§9.4): top queries por tempo total, execuções de cron e
        eventos com severidade <code>erro</code>.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Top queries (pg_stat_statements)</CardTitle>
        </CardHeader>
        <CardContent>
          {lq ? (
            <Loading />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-gray-500">
                  <tr>
                    <th className="py-2">Query</th>
                    <th className="py-2 text-right">Chamadas</th>
                    <th className="py-2 text-right">Total (ms)</th>
                    <th className="py-2 text-right">Média (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  {(topQueries ?? []).map((q, i: number) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="py-2 pr-2 font-mono text-xs">{q.query}</td>
                      <td className="py-2 text-right">{q.calls}</td>
                      <td className="py-2 text-right">{Number(q.total_exec_time_ms).toFixed(1)}</td>
                      <td className="py-2 text-right">{Number(q.mean_exec_time_ms).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimas execuções de cron</CardTitle>
        </CardHeader>
        <CardContent>
          {lj ? (
            <Loading />
          ) : (
            <ul className="divide-y divide-gray-100">
              {(jobs ?? []).map((j) => (
                <li key={j.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{j.job_nome}</p>
                    <p className="text-xs text-gray-500">{formatDataHora(j.iniciado_em)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600">
                      {j.itens_processados} ok / {j.itens_falha} falha
                    </span>
                    <Badge variant={j.status === 'ok' ? 'success' : j.status === 'parcial' ? 'warning' : 'danger'}>
                      {j.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Eventos recentes com severidade erro</CardTitle>
        </CardHeader>
        <CardContent>
          {le ? (
            <Loading />
          ) : (erros ?? []).length === 0 ? (
            <p className="text-sm text-gray-500">Sem erros nos últimos eventos.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {(erros ?? []).map((e) => (
                <li key={e.id} className="py-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">{e.tipo}</span>
                    <span className="text-xs text-gray-500">{formatDataHora(e.created_at)}</span>
                  </div>
                  <pre className="mt-1 overflow-x-auto rounded bg-gray-50 p-2 text-xs text-gray-700">
                    {JSON.stringify(e.payload, null, 2)}
                  </pre>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
