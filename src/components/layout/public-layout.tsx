import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface PublicLayoutProps {
  children: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          padding: '14px 24px',
          borderBottom: '0.5px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--paper)',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="brand-mark">N</div>
          <span className="brand-wm">
            Nutri<em></em>
          </span>
        </Link>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Link to="/login" className="btn ghost">
            Entrar
          </Link>
          <Link to="/cadastro" className="btn primary">
            Criar conta
          </Link>
        </div>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  )
}
