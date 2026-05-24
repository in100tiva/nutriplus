import { Link } from 'react-router-dom'
import { Catalogo } from './catalogo'
import { IconChevL } from '@/components/icons'

/**
 * Página pública (sem auth) com o catálogo completo de nutris.
 */
export function MarketplacePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
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
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Link to="/" className="btn ghost">
            <IconChevL />
            Voltar
          </Link>
          <Link to="/login" className="btn">
            Entrar
          </Link>
          <Link to="/cadastro" className="btn primary">
            Criar conta
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 32px 80px' }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          Encontre seu nutricionista
        </div>
        <h1 style={{ fontSize: 44, lineHeight: 1.05, maxWidth: 760 }}>
          Profissionais cadastrados com{' '}
          <em style={{ color: 'var(--accent)' }}>agenda aberta</em> agora.
        </h1>
        <p
          style={{
            marginTop: 14,
            fontSize: 15.5,
            color: 'var(--ink-3)',
            maxWidth: 600,
            lineHeight: 1.55,
          }}
        >
          Veja preço, especialidades e horários disponíveis. Você só faz cadastro no
          momento de confirmar a consulta.
        </p>

        <div style={{ marginTop: 32 }}>
          <Catalogo />
        </div>
      </main>
    </div>
  )
}
