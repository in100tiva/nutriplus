import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

const FEATURES = [
  {
    title: 'Agenda + autoagendamento',
    description:
      'Defina suas janelas; o paciente escolhe o horário e a consulta nasce confirmada.',
  },
  {
    title: 'Prontuário com isolamento RLS',
    description:
      'Anamnese, evolução e antropometria — só você e o paciente acessam, pelo Postgres.',
  },
  {
    title: 'Plano alimentar com TACO',
    description:
      'Refeições com itens da base TACO; kcal e macros calculados em tempo real.',
  },
  {
    title: 'Teleconsulta embutida',
    description: 'Sala de vídeo dentro da plataforma — sem redirecionar para fora.',
  },
]

export interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="app" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', height: '100vh' }}>
      <aside
        style={{
          background: 'var(--ink)',
          color: 'var(--paper)',
          padding: '36px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="hidden lg:flex"
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(60% 40% at 10% 0%, color-mix(in oklch, var(--accent) 28%, transparent), transparent), radial-gradient(60% 50% at 100% 100%, color-mix(in oklch, var(--accent-3) 22%, transparent), transparent)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, color: 'inherit' }}>
            <div
              className="brand-mark"
              style={{ width: 32, height: 32, fontSize: 19, borderRadius: 10 }}
            >
              N
            </div>
            <span
              className="brand-wm"
              style={{ color: 'var(--paper)', fontSize: 22 }}
            >
              Nutri<em></em>
            </span>
          </Link>
        </div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 460 }}>
          <h1 style={{ color: 'var(--paper)', fontSize: 38, lineHeight: 1.1 }}>
            O consultório digital do nutricionista.
          </h1>
          <p
            style={{
              color: 'color-mix(in oklch, var(--paper) 70%, transparent)',
              fontSize: 15,
              marginTop: 14,
              lineHeight: 1.5,
            }}
          >
            Receba pacientes, atenda online, mantenha planos e evolução em um só lugar.
          </p>
          <div style={{ display: 'grid', gap: 14, marginTop: 28 }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    marginTop: 7,
                    borderRadius: 999,
                    background: 'var(--accent-3)',
                    flex: 'none',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13.5 }}>{f.title}</div>
                  <div
                    style={{
                      color: 'color-mix(in oklch, var(--paper) 55%, transparent)',
                      fontSize: 12.5,
                      marginTop: 2,
                      lineHeight: 1.45,
                    }}
                  >
                    {f.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            fontSize: 11.5,
            color: 'color-mix(in oklch, var(--paper) 45%, transparent)',
          }}
        >
          © {new Date().getFullYear()} Nutri · consultório digital
        </div>
      </aside>

      <main
        style={{
          display: 'grid',
          placeItems: 'center',
          padding: 28,
          background: 'var(--paper)',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          <Link
            to="/"
            className="lg:hidden"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 20 }}
          >
            <div className="brand-mark">N</div>
            <span className="brand-wm">
              Nutri<em></em>
            </span>
          </Link>
          {children}
        </div>
      </main>
    </div>
  )
}
