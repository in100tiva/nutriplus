import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { HeartPulse, ArrowLeft, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Loading,
  EmptyState,
} from '@/components/ui'
import { centavosParaBRL } from '@/lib/utils'
import { formatDataHora } from '@/lib/format'
import { toastError, toastSuccess } from '@/hooks/use-toast'
import { newRequestId, log } from '@/lib/observability'

export function NutriPublicPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const session = useAuth((s) => s.session)
  const [selecionado, setSelecionado] = useState<{ slot_inicio: string; slot_fim: string } | null>(
    null,
  )

  const { data: nutri, isLoading } = useQuery({
    queryKey: ['nutri-publico', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data } = await supabase
        .from('nutricionistas')
        .select(
          'id, profile_id, crn, bio, slug, valor_consulta_centavos, duracao_consulta_min, ativo, profiles!nutricionistas_profile_id_fkey(nome, avatar_url), nutricionista_especialidades(especialidades(nome))',
        )
        .eq('slug', slug!)
        .eq('ativo', true)
        .maybeSingle()
      return data
    },
  })

  const { data: slots } = useQuery({
    queryKey: ['slots', nutri?.id],
    enabled: !!nutri?.id,
    queryFn: async () => {
      const inicio = new Date()
      const fim = new Date()
      fim.setDate(fim.getDate() + 14)
      const { data, error } = await supabase.rpc('fn_slots_disponiveis', {
        p_nutri_id: nutri!.id,
        p_inicio: inicio.toISOString(),
        p_fim: fim.toISOString(),
      })
      if (error) throw error
      return data ?? []
    },
  })

  const agendar = useMutation({
    mutationFn: async () => {
      if (!session?.user) {
        navigate('/cadastro')
        throw new Error('Faça login ou cadastre-se para agendar')
      }
      if (!nutri || !selecionado) throw new Error('Slot inválido')
      const rid = newRequestId()
      const t0 = performance.now()
      const { data, error } = await supabase
        .from('agendamentos')
        .insert({
          nutricionista_id: nutri.id,
          paciente_profile_id: session.user.id,
          inicio: selecionado.slot_inicio,
          fim: selecionado.slot_fim,
          status: 'confirmado',
        })
        .select('id')
        .single()
      if (error) throw error
      log({
        tipo: 'agendamento.criado',
        request_id: rid,
        duracao_ms: Math.round(performance.now() - t0),
        entidade: 'agendamento',
        entidade_id: data.id,
      })
    },
    onSuccess: () => {
      toastSuccess('Consulta agendada! Confira em "Consultas".')
      setSelecionado(null)
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      navigate('/paciente/agendamentos')
    },
    onError: (err: Error) => toastError('Não foi possível agendar', err.message),
  })

  if (isLoading) return <Loading label="Carregando perfil..." />
  if (!nutri) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <EmptyState
          title="Profissional não encontrado"
          description="Verifique o link ou volte para a página inicial."
        />
        <div className="mt-6 text-center">
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const nomePerfil =
    (nutri.profiles as { nome?: string; avatar_url?: string } | null)?.nome ?? 'Nutricionista'
  const especialidades =
    (
      nutri.nutricionista_especialidades as unknown as
        | Array<{ especialidades: { nome: string } | null }>
        | null
    )
      ?.map((e) => e.especialidades?.nome ?? '')
      .filter(Boolean) ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
              <HeartPulse className="h-4 w-4" />
            </div>
            <span className="font-semibold">NutriPlus</span>
          </Link>
          {session ? (
            <Link to="/paciente/agendamentos">
              <Button variant="ghost" size="sm">
                Minhas consultas
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-semibold text-emerald-700">
                  {nomePerfil.charAt(0).toUpperCase()}
                </div>
                <div>
                  <CardTitle>{nomePerfil}</CardTitle>
                  <p className="text-sm text-gray-500">CRN {nutri.crn}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {especialidades.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {especialidades.map((e) => (
                    <span
                      key={e}
                      className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              )}
              {nutri.bio ? (
                <p className="text-sm leading-relaxed text-gray-700">{nutri.bio}</p>
              ) : (
                <p className="text-sm text-gray-400">Sem biografia cadastrada.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consulta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-700">
                {centavosParaBRL(nutri.valor_consulta_centavos)}
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <Clock className="h-4 w-4" /> {nutri.duracao_consulta_min} minutos
              </p>
              <p className="mt-3 text-xs text-gray-500">
                O pagamento, quando aplicável, é combinado fora da plataforma neste momento.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Escolha um horário</CardTitle>
          </CardHeader>
          <CardContent>
            {!slots || slots.length === 0 ? (
              <EmptyState
                title="Sem horários disponíveis"
                description="Volte mais tarde ou entre em contato."
              />
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {slots.map((s) => {
                  const ativo =
                    selecionado?.slot_inicio === s.slot_inicio &&
                    selecionado?.slot_fim === s.slot_fim
                  return (
                    <button
                      key={s.slot_inicio}
                      type="button"
                      onClick={() => setSelecionado(s)}
                      className={`rounded-lg border p-3 text-left text-sm transition ${
                        ativo
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      {formatDataHora(s.slot_inicio)}
                    </button>
                  )
                })}
              </div>
            )}

            {selecionado && (
              <div className="mt-4 flex items-center justify-between rounded-lg bg-emerald-50 p-4">
                <p className="text-sm text-emerald-900">
                  Selecionado: <strong>{formatDataHora(selecionado.slot_inicio)}</strong>
                </p>
                <Button onClick={() => agendar.mutate()} loading={agendar.isPending}>
                  {session ? 'Confirmar agendamento' : 'Entrar e agendar'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
