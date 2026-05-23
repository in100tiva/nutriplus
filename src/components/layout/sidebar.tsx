import { Link, useLocation } from 'react-router-dom'
import { cn, getInitials } from '@/lib/utils'
import {
  IconAgenda,
  IconUsers,
  IconPlate,
  IconVideo,
  IconChart,
  IconUser,
  IconHealth,
  IconChevD,
  IconBell,
} from '@/components/icons'
import type { ComponentType, SVGProps } from 'react'
import type { UserRole } from '@/types'

interface NavItemDef {
  label: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  badge?: string
  match?: string[]
}

interface SidebarUser {
  name: string
  avatarUrl?: string
  sub?: string
}

export interface SidebarProps {
  role: UserRole
  user: SidebarUser
  onSignOut?: () => void
}

const NUTRI_NAV: { group: string; items: NavItemDef[] }[] = [
  {
    group: 'Consultório',
    items: [
      { label: 'Agenda', href: '/app', icon: IconAgenda },
      {
        label: 'Pacientes',
        href: '/app/pacientes',
        icon: IconUsers,
        match: ['/app/pacientes'],
      },
      { label: 'Planos alimentares', href: '/app/planos', icon: IconPlate },
      { label: 'Sala de consulta', href: '/app/consulta', icon: IconVideo },
    ],
  },
  {
    group: 'Operações',
    items: [{ label: 'Perfil profissional', href: '/app/perfil', icon: IconUser }],
  },
]

const PACIENTE_NAV: { group: string; items: NavItemDef[] }[] = [
  {
    group: 'Meu acompanhamento',
    items: [
      { label: 'Consultas', href: '/paciente/agendamentos', icon: IconAgenda },
      { label: 'Meu plano', href: '/paciente/plano', icon: IconPlate },
      { label: 'Evolução', href: '/paciente/evolucao', icon: IconChart },
    ],
  },
]

const ADMIN_NAV: { group: string; items: NavItemDef[] }[] = [
  {
    group: 'Operações',
    items: [{ label: '/admin/saude', href: '/admin/saude', icon: IconHealth }],
  },
]

export function Sidebar({ role, user, onSignOut }: SidebarProps) {
  const location = useLocation()
  const groups =
    role === 'nutricionista' ? NUTRI_NAV : role === 'paciente' ? PACIENTE_NAV : ADMIN_NAV

  const isActive = (href: string, match?: string[]) => {
    if (location.pathname === href) return true
    if (match?.some((m) => location.pathname.startsWith(m))) return true
    if (href !== '/app' && href !== '/paciente' && location.pathname.startsWith(href)) return true
    return false
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">N</div>
        <div className="brand-wm">
          Nutri<em></em>
        </div>
        <button
          type="button"
          className="icon-btn"
          style={{ width: 26, height: 26, marginLeft: 'auto' }}
          aria-label="Notificações"
        >
          <IconBell />
        </button>
      </div>

      <div className="who">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="ava"
            style={{ width: 30, height: 30, objectFit: 'cover' }}
          />
        ) : (
          <div className="ava" style={{ width: 30, height: 30 }}>
            {getInitials(user.name)}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="who-name truncate">{user.name}</div>
          {user.sub && <div className="who-sub truncate">{user.sub}</div>}
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="icon-btn"
          style={{ width: 24, height: 24, border: 0, background: 'transparent' }}
          aria-label="Menu do usuário"
          title="Sair"
        >
          <IconChevD />
        </button>
      </div>

      <nav className="nav">
        {groups.map((g) => (
          <div key={g.group}>
            <div className="nav-group">{g.group}</div>
            {g.items.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href, item.match)
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn('nav-item', active && 'active')}
                >
                  <span className="nav-icon">
                    <Icon />
                  </span>
                  <span>{item.label}</span>
                  {item.badge && <span className="badge">{item.badge}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="dot-ok" />
        <span>Sistemas estáveis</span>
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="ml-auto"
            style={{
              appearance: 'none',
              border: 0,
              background: 'transparent',
              color: 'var(--ink-3)',
              fontSize: 11.5,
              cursor: 'default',
            }}
          >
            Sair
          </button>
        )}
      </div>
    </aside>
  )
}
