import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { Card, Button, Loading, EmptyState, Badge } from '@/components/ui'
import { formatDataHora } from '@/lib/format'
import { toastError, toastSuccess } from '@/hooks/use-toast'
import { IconAgenda, IconVideo, IconBell } from '@/components/icons'

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
        `${err.message}. Cancelamento exige antecedência de 24h.`,
      ),
  })

  const { proximas, passadas } = useMemo(() => {
    const agora = Date.now()
    const f: Item[] = []
    const p: Item[] = []
    for (const a of data ?? []) {
      if (new Date(a.inicio).getTime() >= agora) f.push(a)
      else p.push(a)
    }
    f.sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime())
    return { proximas: f, passadas: p }
  }, [data])

  if (isLoading) return <Loading label="Carregando…" />

  const nextItem = proximas[0]

  return (
    <div className="fade-up" data-screen-label="paciente-agendamentos">
      <div className="page-head">
        <div>
          <div className="eyebrow">Área do paciente · {profile?.nome?.split(' ')[0]}</div>
          <h1>Bom dia, {profile?.nome?.split(' ')[0] || 'paciente'}.</h1>
          <p className="sub">
            {nextItem
              ? `Sua próxima consulta com ${nextItem.nutricionistas?.profiles?.nome ?? 'nutri'} está confirmada.`
              : 'Você ainda não tem consultas marcadas.'}
          </p>
        </div>
      </div>

      {/* Hero card: próxima consulta */}
      {nextItem && <NextHero item={nextItem} />}

      {/* Próximas */}
      <Card variant="flush" style={{ marginTop: 18 }}>
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '0.5px solid var(--line)',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
          }}
        >
          <h3 className="serif" style={{ fontSize: 18, fontWeight: 500 }}>
            Próximas consultas
          </h3>
          <span className="muted" style={{ fontSize: 12 }}>
            {proximas.length} agendamento{proximas.length === 1 ? '' : 's'}
          </span>
        </div>
        {proximas.length === 0 ? (
          <EmptyState
            icon={<IconAgenda />}
            title="Sem consultas marcadas"
            description="Acesse o link do seu nutricionista para agendar."
          />
        ) : (
          proximas.map((a, i) => {
            const nome = a.nutricionistas?.profiles?.nome ?? 'Nutricionista'
            const podeEntrar = jaPodeEntrar(a.inicio)
            return (
              <div
                key={a.id}
                className="row"
                style={{
                  paddingInline: 20,
                  borderBottom: i < proximas.length - 1 ? '0.5px solid var(--line-2)' : 0,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>{nome}</div>
                  <div className="muted tnum" style={{ fontSize: 12 }}>
                    {formatDataHora(a.inicio)}
                  </div>
                </div>
                <Badge variant={a.status === 'confirmado' ? 'accent' : 'default'}>{a.status}</Badge>
                {podeEntrar && a.status === 'confirmado' && (
                  <Link to={`/paciente/consulta/${a.id}`} className="btn sm accent">
                    <IconVideo />
                    Entrar
                  </Link>
                )}
                {!podeEntrar && a.status === 'confirmado' && (
                  <Button size="sm" variant="ghost" onClick={() => cancelMutation.mutate(a.id)}>
                    Cancelar
                  </Button>
                )}
              </div>
            )
          })
        )}
      </Card>

      {/* Lembrete card */}
      <Card variant="warm" style={{ marginTop: 18, padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'var(--accent-soft)',
              color: 'color-mix(in oklch, var(--accent) 70%, black)',
              display: 'grid',
              placeItems: 'center',
              flex: 'none',
            }}
          >
            <IconBell />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Lembrete pré-consulta</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2, lineHeight: 1.5 }}>
              Anote dúvidas e sintomas recentes. Você recebe um e-mail 24h e 1h antes.
            </div>
          </div>
        </div>
      </Card>

      {/* Histórico */}
      <Card variant="flush" style={{ marginTop: 18 }}>
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '0.5px solid var(--line)',
          }}
        >
          <h3 className="serif" style={{ fontSize: 18, fontWeight: 500 }}>
            Histórico
          </h3>
        </div>
        {passadas.length === 0 ? (
          <div style={{ padding: 20, color: 'var(--ink-3)', fontSize: 13, textAlign: 'center' }}>
            Nenhuma consulta anterior.
          </div>
        ) : (
          passadas.map((a, i) => (
            <div
              key={a.id}
              className="row"
              style={{
                paddingInline: 20,
                borderBottom: i < passadas.length - 1 ? '0.5px solid var(--line-2)' : 0,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13 }}>
                  {a.nutricionistas?.profiles?.nome ?? 'Nutricionista'} ·{' '}
                  <span className="muted">{formatDataHora(a.inicio)}</span>
                </div>
              </div>
              <Badge>{a.status}</Badge>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}

function NextHero({ item }: { item: Item }) {
  const nome = item.nutricionistas?.profiles?.nome ?? 'Nutri'
  const podeEntrar = jaPodeEntrar(item.inicio)
  const minsAte = Math.round((new Date(item.inicio).getTime() - Date.now()) / 60000)
  const txtCountdown =
    minsAte < 60 ? `em ${minsAte} min` : `em ${Math.floor(minsAte / 60)}h ${minsAte % 60}min`
  return (
    <Card variant="dark" style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          padding: 28,
          gap: 24,
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: 'color-mix(in oklch, var(--paper) 60%, transparent)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Próxima consulta
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <h2 style={{ fontSize: 36, color: 'var(--paper)', fontWeight: 400 }}>
              {formatDataHora(item.inicio)}
            </h2>
            <span
              className="mono tnum"
              style={{ color: 'color-mix(in oklch, var(--paper) 55%, transparent)', fontSize: 13 }}
            >
              {txtCountdown}
            </span>
          </div>
          <div
            style={{
              fontSize: 13.5,
              color: 'color-mix(in oklch, var(--paper) 70%, transparent)',
              marginTop: 8,
            }}
          >
            Teleconsulta integrada · com {nome}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            {podeEntrar ? (
              <Link to={`/paciente/consulta/${item.id}`} className="btn accent">
                <IconVideo />
                Entrar na consulta
              </Link>
            ) : (
              <Button
                disabled
                style={{
                  background: 'transparent',
                  borderColor: 'color-mix(in oklch, var(--paper) 25%, transparent)',
                  color: 'var(--paper)',
                }}
              >
                Abre 10 min antes
              </Button>
            )}
            {item.nutricionistas?.slug && (
              <Link
                to={`/nutri/${item.nutricionistas.slug}`}
                className="btn"
                style={{
                  background: 'transparent',
                  borderColor: 'color-mix(in oklch, var(--paper) 25%, transparent)',
                  color: 'var(--paper)',
                }}
              >
                Página do profissional
              </Link>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

function jaPodeEntrar(inicioIso: string): boolean {
  return new Date(inicioIso).getTime() - Date.now() <= 10 * 60 * 1000
}
