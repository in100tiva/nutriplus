import { Link } from 'react-router-dom'
import {
  IconAgenda,
  IconPlate,
  IconVideo,
  IconChart,
  IconChevR,
} from '@/components/icons'

const FEATURES = [
  {
    icon: IconAgenda,
    title: 'Agenda + autoagendamento',
    description:
      'Defina suas janelas de disponibilidade; o paciente escolhe o horário e a consulta nasce confirmada — sem etapa de pagamento no MVP.',
  },
  {
    icon: IconVideo,
    title: 'Teleconsulta embutida',
    description:
      'Sala de vídeo na própria plataforma via Daily.co. Botão "Entrar" aparece 10 min antes — sem polling, calculado no cliente.',
  },
  {
    icon: IconPlate,
    title: 'Planos alimentares com TACO',
    description:
      'Refeições com itens da base TACO. kcal e macros recalculados a cada item via função SQL nomeada (visível no pg_stat_statements).',
  },
  {
    icon: IconChart,
    title: 'Evolução compartilhada',
    description:
      'Antropometria datada vira gráfico para você e para o paciente. Reforço de progresso por si só.',
  },
]

export function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      {/* Header */}
      <header
        style={{
          padding: '18px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          borderBottom: '0.5px solid var(--line)',
          background: 'color-mix(in oklch, var(--paper) 80%, transparent)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="brand-mark">N</div>
          <span className="brand-wm">
            Nutri<em></em>
          </span>
        </Link>
        <span className="chip ml-3 hidden sm:inline-flex" style={{ marginLeft: 12 }}>
          MVP em construção
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Link to="/login" className="btn ghost">
            Entrar
          </Link>
          <Link to="/cadastro" className="btn primary">
            Criar conta
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          padding: '88px 32px 64px',
          maxWidth: 1080,
          margin: '0 auto',
        }}
      >
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          Consultório digital · nutricionistas
        </div>
        <h1
          style={{
            fontSize: 56,
            lineHeight: 1.02,
            letterSpacing: '-0.025em',
            maxWidth: 820,
          }}
        >
          O <em style={{ color: 'var(--accent)' }}>escritório virtual</em> para receber
          pacientes, atender online e acompanhar evolução — sem ferramenta extra.
        </h1>
        <p
          style={{
            marginTop: 18,
            fontSize: 17,
            color: 'var(--ink-3)',
            maxWidth: 640,
            lineHeight: 1.55,
          }}
        >
          Agenda, prontuário, plano alimentar TACO, teleconsulta e gráficos de evolução em
          uma plataforma só. Cobrança fica para a fase futura — o foco do MVP é o núcleo
          do produto.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          <Link to="/cadastro" className="btn accent lg">
            Começar como nutricionista
            <IconChevR />
          </Link>
          <Link to="/cadastro" className="btn lg">
            Sou paciente
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section
        style={{
          padding: '32px 32px 96px',
          maxWidth: 1080,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="card">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--accent-soft)',
                    color: 'color-mix(in oklch, var(--accent) 75%, black)',
                    display: 'grid',
                    placeItems: 'center',
                    marginBottom: 14,
                  }}
                >
                  <Icon />
                </div>
                <h3 className="serif" style={{ fontSize: 20, fontWeight: 500 }}>
                  {f.title}
                </h3>
                <p style={{ marginTop: 6, fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.55 }}>
                  {f.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '0.5px solid var(--line)',
          padding: '20px 32px',
          display: 'flex',
          gap: 20,
          alignItems: 'center',
          fontSize: 12,
          color: 'var(--ink-3)',
          background: 'var(--paper-2)',
        }}
      >
        <div>© {new Date().getFullYear()} Nutri</div>
        <div className="ml-auto" style={{ marginLeft: 'auto' }}>
          Construído com Supabase, React, Tailwind e Daily.co
        </div>
      </footer>
    </div>
  )
}
