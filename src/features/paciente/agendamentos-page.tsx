import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Calendar as CalendarIcon, Video } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Loading,
  EmptyState,
  Badge,
} from '@/components/ui'
import { formatDataHora } from '@/lib/format'
import { toastError, toastSuccess } from '@/hooks/use-toast'

type Item = {
  id: string
  inicio: string
  fim: string
  status: string
  daily_room_url: string | null
  nutricionistas: {
    id: string
    slug: string
    profiles: { nome: string } | null
  } | null
}

export function PacienteAgendamentosPage() {
  const profile = useAuth((s) => s.profile)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['paciente-agendamentos', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(
          'id, inicio, fim, status, daily_room_url, nutricionistas!agendamentos_nutricionista_id_fkey(id, slug, profiles!nutricionistas_profile_id_fkey(nome))',
        )
        .eq('paciente_profile_id', profile!.id)
        .order('inicio', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as Item[]
    },
  })

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: 'cancelado' })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      toastSuccess('Consulta cancelada')
      queryClient.invalidateQueries({ queryKey: ['paciente-agendamentos'] })
    },
    onError: (err: Error) =>
      toastError(
        'Não foi possível cancelar',
        `${err.message}. Lembre-se: o cancelamento exige antecedência de 24h.`,
      ),
  })

  const { futuros, passados } = useMemo(() => {
    const agora = Date.now()
    const f: Item[] = []
    const p: Item[] = []
    for (const a of data ?? []) {
      if (new Date(a.inicio).getTime() >= agora) f.push(a)
      else p.push(a)
    }
    f.sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime())
    return { futuros: f, passados: p }
  }, [data])

  if (isLoading) return <Loading label="Carregando..." />

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Minhas consultas</h2>

      <Card>
        <CardHeader>
          <CardTitle>Próximas</CardTitle>
        </CardHeader>
        <CardContent>
          {futuros.length === 0 ? (
            <EmptyState
              icon={<CalendarIcon className="h-5 w-5" />}
              title="Sem consultas marcadas"
              description="Acesse o link do seu nutricionista para agendar."
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {futuros.map((a) => {
                const nome = a.nutricionistas?.profiles?.nome ?? 'Nutricionista'
                const pode10Min = pertoOuJaComecou(a.inicio)
                return (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{nome}</p>
                      <p className="text-xs text-gray-500">{formatDataHora(a.inicio)}</p>
                      <Badge>{a.status}</Badge>
                    </div>
                    <div className="flex gap-2">
                      {pode10Min && a.status === 'confirmado' && (
                        <Link to={`/paciente/consulta/${a.id}`}>
                          <Button size="sm">
                            <Video className="h-4 w-4" /> Entrar
                          </Button>
                        </Link>
                      )}
                      {a.status === 'confirmado' && !pode10Min && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => cancelMutation.mutate(a.id)}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          {passados.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma consulta anterior.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {passados.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-gray-700">
                    {a.nutricionistas?.profiles?.nome ?? 'Nutricionista'} ·{' '}
                    {formatDataHora(a.inicio)}
                  </span>
                  <Badge>{a.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function pertoOuJaComecou(inicioIso: string): boolean {
  const inicio = new Date(inicioIso).getTime()
  const agora = Date.now()
  return inicio - agora <= 10 * 60 * 1000 // 10 minutos antes
}
