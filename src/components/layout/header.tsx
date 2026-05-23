import { Fragment, type ReactNode } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { IconSearch, IconInbox, IconSettings } from '@/components/icons'

export interface Crumb {
  label: string
  href?: string
}

export interface HeaderProps {
  crumbs?: Crumb[]
  searchPlaceholder?: string
  right?: ReactNode
}

const ROUTE_LABELS: Record<string, string> = {
  '/app': 'Agenda',
  '/app/pacientes': 'Pacientes',
  '/app/planos': 'Planos alimentares',
  '/app/perfil': 'Perfil',
  '/app/agenda': 'Agenda',
  '/paciente/agendamentos': 'Consultas',
  '/paciente/plano': 'Meu plano',
  '/paciente/evolucao': 'Evolução',
  '/admin/saude': '/admin/saude',
}

function autoCrumbs(pathname: string): Crumb[] {
  const label = ROUTE_LABELS[pathname]
  if (label) return [{ label }]
  // tenta derivar do prefixo
  for (const prefix of Object.keys(ROUTE_LABELS)) {
    if (pathname.startsWith(prefix + '/')) {
      return [{ label: ROUTE_LABELS[prefix], href: prefix }, { label: 'Detalhe' }]
    }
  }
  return []
}

export function Header({ crumbs, searchPlaceholder = 'Buscar pacientes, alimentos, consultas…', right }: HeaderProps) {
  const { pathname } = useLocation()
  const effective = crumbs ?? autoCrumbs(pathname)

  return (
    <header className="topbar">
      <div className="crumbs">
        {effective.map((c, i) => {
          const last = i === effective.length - 1
          return (
            <Fragment key={i}>
              {i > 0 && <span className="sep">/</span>}
              {c.href && !last ? (
                <Link to={c.href} className="hover:text-[color:var(--ink-2)]">
                  {c.label}
                </Link>
              ) : (
                <span className={last ? 'cur' : ''}>{c.label}</span>
              )}
            </Fragment>
          )
        })}
      </div>

      <div className="topbar-search">
        <IconSearch />
        <input placeholder={searchPlaceholder} />
        <span className="kbd">⌘K</span>
      </div>

      {right ?? (
        <>
          <button type="button" className="icon-btn" aria-label="Mensagens">
            <IconInbox />
          </button>
          <button type="button" className="icon-btn" aria-label="Configurações">
            <IconSettings />
          </button>
        </>
      )}
    </header>
  )
}
