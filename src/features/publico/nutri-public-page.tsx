import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { Button, Card, Loading, EmptyState, Badge } from '@/components/ui'
import { centavosParaBRL } from '@/lib/utils'
import { formatDataHora } from '@/lib/format'
import { toastError, toastSuccess } from '@/hooks/use-toast'
import { newRequestId, log } from '@/lib/observability'
import { IconChevL, IconUser } from '@/components/icons'

interface Nutri {
  id: string
  profile_id: string
  crn: string
  bio: string | null
  slug: string
  valor_consulta_centavos: number
  duracao_consulta_min: number
  ativo: boolean
  profiles: { nome: string; avatar_url: string | null } | null
  nutricionista_especialidades: Array<{ especialidades: { nome: string } | null }>
}

interface Slot {
  slot_inicio: string
  slot_fim: string
}

export function NutriPublicPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { session, profile } = useAuth()
  const [searchParams] = useSearchParams()
  const [selecionado, setSelecionado] = useState<Slot | null>(null)

  // Slot pré-selecionado via query (?inicio=ISO&fim=ISO) — usado quando
  // o usuário volta do fluxo de cadastro/login após escolher um horário.
  const slotInicioQuery = searchParams.get('inicio')
  const slotFimQuery = searchParams.get('fim')

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
      return data as unknown as Nutri | null
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
      return (data ?? []) as Slot[]
    },
  })

  // Hidrata o slot pré-selecionado quando a lista carrega e a query indica um.
  useEffect(() => {
    if (selecionado || !slots || !slotInicioQuery || !slotFimQuery) return
    const match = slots.find(
      (s) => s.slot_inicio === slotInicioQuery && s.slot_fim === slotFimQuery,
    )
    if (match) setSelecionado(match)
  }, [slots, slotInicioQuery, slotFimQuery, selecionado])

  const podeAgendarComoPaciente = !session || profile?.role === 'paciente'

  const agendar = useMutation({
    mutationFn: async () => {
      if (!nutri || !selecionado) throw new Error('Slot inválido')
      if (!session?.user) {
        // Sem login: redireciona para cadastro preservando slot + slug.
        const ret = `/nutri/${nutri.slug}?inicio=${encodeURIComponent(selecionado.slot_inicio)}&fim=${encodeURIComponent(selecionado.slot_fim)}`
        navigate(`/cadastro?papel=paciente&return=${encodeURIComponent(ret)}`)
        return
      }
      if (profile?.role && profile.role !== 'paciente') {
        throw new Error('Apenas pacientes podem agendar consultas')
      }
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
      if (!session) return // foi pra cadastro; toast vem de lá
      toastSuccess('Consulta agendada!', 'Confira em "Minhas consultas".')
      setSelecionado(null)
      // Invalida slots E a lista de agendamentos do paciente — sem isso o
      // React Query mostra o cache antigo (vazio) e parece que nada foi marcado.
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      queryClient.invalidateQueries({ queryKey: ['paciente-agendamentos'] })
      navigate('/paciente/agendamentos')
    },
    onError: (err: Error) => toastError('Não foi possível agendar', err.message),
  })

  if (isLoading) return <Loading label="Carregando perfil…" />
  if (!nutri) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <EmptyState
          icon={<IconUser />}
          title="Profissional não encontrado"
          description="Verifique o link ou volte para a página inicial."
          action={
            <Link to="/" className="btn">
              <IconChevL />
              Voltar
            </Link>
          }
        />
      </div>
    )
  }

  const nomePerfil = nutri.profiles?.nome ?? 'Nutricionista'
  const especialidades = (nutri.nutricionista_especialidades ?? [])
    .map((e) => e.especialidades?.nome ?? '')
    .filter(Boolean)

  // Agrupar slots por dia
  const slotsByDay = new Map<string, Slot[]>()
  for (const s of slots ?? []) {
    const dia = new Date(s.slot_inicio).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
    })
    const arr = slotsByDay.get(dia) ?? []
    arr.push(s)
    slotsByDay.set(dia, arr)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <header
        style={{
          padding: '16px 24px',
          borderBottom: '0.5px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="brand-mark">N</div>
          <span className="brand-wm">
            Nutri<em></em>
          </span>
        </Link>
        <Link
          to="/nutricionistas"
          className="btn ghost sm"
          style={{ marginLeft: 14 }}
        >
          <IconChevL />
          Ver outros profissionais
        </Link>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {session ? (
            <Link to="/paciente/agendamentos" className="btn ghost">
              Minhas consultas
            </Link>
          ) : (
            <Link to="/login" className="btn ghost">
              Entrar
            </Link>
          )}
        </div>
      </header>

      <main
        style={{
          maxWidth: 980,
          margin: '0 auto',
          padding: '36px 24px 80px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, marginBottom: 24 }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="ava xl">{nomePerfil.charAt(0).toUpperCase()}</div>
              <div style={{ minWidth: 0 }}>
                <div className="eyebrow">Nutricionista</div>
                <h1 style={{ fontSize: 30, marginTop: 4 }}>{nomePerfil}</h1>
                <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                  CRN {nutri.crn}
                </p>
              </div>
            </div>
            {especialidades.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                {especialidades.map((e) => (
                  <Badge key={e} variant="accent">
                    {e}
                  </Badge>
                ))}
              </div>
            )}
            {nutri.bio ? (
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--ink-2)',
                  marginTop: 16,
                  lineHeight: 1.55,
                }}
              >
                {nutri.bio}
              </p>
            ) : (
              <p className="muted" style={{ fontSize: 13, marginTop: 16 }}>
                Sem biografia.
              </p>
            )}
          </Card>

          <Card>
            <div className="eyebrow" style={{ marginBottom: 6 }}>
              Consulta
            </div>
            <div
              className="serif tnum"
              style={{ fontSize: 30, color: 'var(--accent)', fontWeight: 500 }}
            >
              {centavosParaBRL(nutri.valor_consulta_centavos)}
            </div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              {nutri.duracao_consulta_min} minutos · teleconsulta
            </div>
            <p className="muted" style={{ fontSize: 12, marginTop: 14, lineHeight: 1.5 }}>
              Pagamento, quando aplicável, é combinado fora da plataforma neste MVP.
            </p>
          </Card>
        </div>

        <Card variant="flush">
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '0.5px solid var(--line)',
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3 className="serif" style={{ fontSize: 18, fontWeight: 500 }}>
                Escolha um horário
              </h3>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                Slots derivados de{' '}
                <span className="mono">fn_slots_disponiveis(nutri, intervalo)</span>
              </div>
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              próximos 14 dias
            </div>
          </div>
          <div style={{ padding: 20 }}>
            {!slots || slots.length === 0 ? (
              <EmptyState
                title="Sem horários disponíveis"
                description="Volte mais tarde ou entre em contato."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {Array.from(slotsByDay.entries()).map(([dia, dayslots]) => (
                  <div key={dia}>
                    <div
                      className="lbl"
                      style={{
                        fontSize: 10.5,
                        color: 'var(--ink-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        fontWeight: 600,
                        marginBottom: 8,
                      }}
                    >
                      {dia}
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: 6,
                      }}
                    >
                      {dayslots.map((s) => {
                        const ativo = selecionado?.slot_inicio === s.slot_inicio
                        return (
                          <button
                            key={s.slot_inicio}
                            type="button"
                            onClick={() => setSelecionado(s)}
                            className="mono tnum"
                            style={{
                              appearance: 'none',
                              border: ativo ? '1px solid var(--accent)' : '0.5px solid var(--line)',
                              background: ativo ? 'var(--accent-soft)' : 'var(--paper-2)',
                              color: ativo
                                ? 'color-mix(in oklch, var(--accent) 80%, black)'
                                : 'var(--ink-2)',
                              padding: '10px 8px',
                              borderRadius: 8,
                              font: 'inherit',
                              fontSize: 13,
                              fontWeight: 500,
                              cursor: 'default',
                            }}
                          >
                            {formatDataHora(s.slot_inicio).slice(11)}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selecionado && (
              <div
                style={{
                  marginTop: 18,
                  padding: 14,
                  background: 'var(--accent-soft)',
                  borderRadius: 10,
                  border: '0.5px solid color-mix(in oklch, var(--accent) 25%, var(--line))',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, fontSize: 13.5, minWidth: 240 }}>
                  Selecionado: <strong>{formatDataHora(selecionado.slot_inicio)}</strong>{' '}
                  · consulta nasce <Badge variant="accent">confirmada</Badge>
                </div>
                {!podeAgendarComoPaciente ? (
                  <Badge variant="warn">
                    Logado como nutri/admin — saia para agendar como paciente
                  </Badge>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => agendar.mutate()}
                    loading={agendar.isPending}
                  >
                    {session ? 'Confirmar agendamento' : 'Cadastrar e agendar'}
                  </Button>
                )}
              </div>
            )}
            {!session && (
              <p
                className="muted"
                style={{ fontSize: 12, marginTop: 14, lineHeight: 1.5 }}
              >
                Já tem conta?{' '}
                <Link
                  to={`/login?return=${encodeURIComponent(
                    `/nutri/${nutri.slug}${
                      selecionado
                        ? `?inicio=${encodeURIComponent(selecionado.slot_inicio)}&fim=${encodeURIComponent(selecionado.slot_fim)}`
                        : ''
                    }`,
                  )}`}
                  style={{ color: 'var(--accent)', fontWeight: 500 }}
                >
                  Entrar
                </Link>
                .
              </p>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}
