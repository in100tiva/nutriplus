import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { Loading, Button } from '@/components/ui'
import { Donut } from '@/components/charts'
import { formatDataHora } from '@/lib/format'
import { IconAgenda, IconUsers, IconPlate, IconChevR, IconVideo } from '@/components/icons'

interface Item {
  id: string
  inicio: string
  fim: string
  status: string
  paciente_profile_id: string
  profiles: { nome: string } | null
}

export function NutriDashboard() {
  const profile = useAuth((s) => s.profile)

  const { data: nutri } = useQuery({
    queryKey: ['nutri-self', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('nutricionistas')
        .select('id, slug')
        .eq('profile_id', profile!.id)
        .maybeSingle()
      return data
    },
  })

  const { data: proximos, isLoading } = useQuery({
    queryKey: ['proximos-agendamentos', nutri?.id],
    enabled: !!nutri?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('agendamentos')
        .select(
          'id, inicio, fim, status, paciente_profile_id, profiles!agendamentos_paciente_profile_id_fkey(nome)',
        )
        .eq('nutricionista_id', nutri!.id)
        .gte('inicio', new Date().toISOString())
        .eq('status', 'confirmado')
        .order('inicio', { ascending: true })
        .limit(8)
      return (data ?? []) as unknown as Item[]
    },
  })

  const totalProximos = proximos?.length ?? 0
  const proximaHora =
    proximos && proximos.length > 0 ? formatDataHora(proximos[0].inicio) : '—'

  return (
    <div className="fade-up" data-screen-label="dashboard-nutri">
      <div className="page-head">
        <div>
          <div className="eyebrow">Início</div>
          <div className="title">
            <h1>Olá, {profile?.nome?.split(' ')[0] || 'nutricionista'}.</h1>
          </div>
          <p className="sub">
            Visão rápida da sua semana — agenda, pacientes em acompanhamento e planos
            ativos.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/app" className="btn">
            <IconAgenda />
            Ir para agenda
          </Link>
          {nutri?.slug && (
            <Link to={`/nutri/${nutri.slug}`} className="btn accent">
              Página pública
              <IconChevR />
            </Link>
          )}
        </div>
      </div>

      {/* Stat strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div className="card" style={{ padding: 16 }}>
          <div className="stat">
            <div className="lbl">Próximas confirmadas</div>
            <div className="val tnum">{totalProximos}</div>
            <div className="delta">próxima: {proximaHora}</div>
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="stat">
            <div className="lbl">Próxima consulta</div>
            <div className="val tnum">{proximaHora === '—' ? '—' : proximaHora.split(' ')[1]}</div>
            <div className="delta muted">{proximaHora === '—' ? 'sem agendamento' : proximaHora.split(' ')[0]}</div>
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="stat">
            <div className="lbl">Slot público</div>
            <div className="val tnum">{nutri?.slug ? 'ativo' : '—'}</div>
            <div className="delta">{nutri?.slug ? `/nutri/${nutri.slug}` : 'configure no perfil'}</div>
          </div>
        </div>
        <div
          className="card"
          style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}
        >
          <Donut size={60} stroke={7} pct={Math.min(totalProximos / 10, 1)} label="Carga" sub="da semana" />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              fontSize: 11.5,
              color: 'var(--ink-3)',
            }}
          >
            <div>Capacidade modelo: 10 consultas/semana</div>
            <div>
              <Link to="/app" className="hover:underline" style={{ color: 'var(--accent)' }}>
                Ver agenda completa →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 18,
        }}
      >
        <QuickLink to="/app" icon={IconAgenda} title="Agenda" subtitle="Disponibilidade e consultas" />
        <QuickLink
          to="/app/pacientes"
          icon={IconUsers}
          title="Pacientes"
          subtitle="Prontuários e antropometria"
        />
        <QuickLink
          to="/app/planos"
          icon={IconPlate}
          title="Planos alimentares"
          subtitle="TACO + cálculo de macros"
        />
      </div>

      {/* Próximas consultas */}
      <div className="card" style={{ padding: 0 }}>
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
              Próximas consultas confirmadas
            </h3>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
              {totalProximos} agendamento{totalProximos === 1 ? '' : 's'}
            </div>
          </div>
        </div>
        {isLoading ? (
          <Loading />
        ) : !proximos || proximos.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
            Nenhuma consulta confirmada.
          </div>
        ) : (
          proximos.map((a) => {
            const nome = a.profiles?.nome ?? 'Paciente'
            return (
              <div className="row" key={a.id} style={{ paddingInline: 20 }}>
                <div
                  className="mono tnum"
                  style={{ width: 110, fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500 }}
                >
                  {formatDataHora(a.inicio)}
                </div>
                <div style={{ flex: 1, fontWeight: 500 }}>{nome}</div>
                <Link to={`/app/consulta/${a.id}`} className="btn sm accent">
                  <IconVideo />
                  Entrar
                </Link>
                <Button size="sm" onClick={() => {}}>
                  Prontuário
                </Button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

interface QuickLinkProps {
  to: string
  icon: typeof IconAgenda
  title: string
  subtitle: string
}

function QuickLink({ to, icon: Icon, title, subtitle }: QuickLinkProps) {
  return (
    <Link
      to={to}
      className="card hover:bg-[color:var(--paper-2)]"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: 16,
        transition: 'background .15s',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'var(--accent-soft)',
          color: 'color-mix(in oklch, var(--accent) 75%, black)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Icon />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500 }}>{title}</div>
        <div className="muted" style={{ fontSize: 12 }}>
          {subtitle}
        </div>
      </div>
      <IconChevR />
    </Link>
  )
}
