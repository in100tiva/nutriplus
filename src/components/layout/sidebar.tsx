import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Users,
  UtensilsCrossed,
  UserCog,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HeartPulse,
  LineChart,
  Activity,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

interface SidebarUser {
  name: string
  avatarUrl?: string
  role: string
}

export interface SidebarProps {
  role: 'nutricionista' | 'paciente' | 'admin'
  user: SidebarUser
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  onSignOut?: () => void
}

const NUTRI_NAV: NavItem[] = [
  { label: 'Início', href: '/app', icon: LayoutDashboard },
  { label: 'Agenda', href: '/app/agenda', icon: Calendar },
  { label: 'Pacientes', href: '/app/pacientes', icon: Users },
  { label: 'Planos', href: '/app/planos', icon: UtensilsCrossed },
  { label: 'Perfil', href: '/app/perfil', icon: UserCog },
]

const PACIENTE_NAV: NavItem[] = [
  { label: 'Consultas', href: '/paciente/agendamentos', icon: Calendar },
  { label: 'Meu plano', href: '/paciente/plano', icon: UtensilsCrossed },
  { label: 'Evolução', href: '/paciente/evolucao', icon: LineChart },
]

const ADMIN_NAV: NavItem[] = [
  { label: 'Saúde do sistema', href: '/admin/saude', icon: Activity },
]

export function Sidebar({
  role,
  user,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  onSignOut,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const location = useLocation()

  const collapsed = controlledCollapsed ?? internalCollapsed
  const setCollapsed = onCollapsedChange ?? setInternalCollapsed

  const navItems =
    role === 'nutricionista' ? NUTRI_NAV : role === 'paciente' ? PACIENTE_NAV : ADMIN_NAV

  const isActive = (href: string) => {
    if (href === '/app' || href === '/paciente' || href === '/admin/saude') {
      return location.pathname === href
    }
    return location.pathname.startsWith(href)
  }

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-slate-900 text-white transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-64',
      )}
    >
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-slate-700/50 px-4',
          collapsed ? 'justify-center' : 'gap-3',
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
          <HeartPulse className="h-5 w-5" />
        </div>
        {!collapsed && <span className="text-lg font-semibold tracking-tight">NutriPlus</span>}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                    collapsed && 'justify-center px-0',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      active ? 'text-emerald-300' : 'text-slate-400 group-hover:text-white',
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {active && (
                    <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-emerald-400" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-700/50 px-2 py-2">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white',
            collapsed && 'justify-center px-0',
          )}
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 shrink-0" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>

      <div
        className={cn(
          'flex shrink-0 items-center border-t border-slate-700/50 p-3',
          collapsed ? 'justify-center' : 'gap-3',
        )}
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-slate-200">
            {getInitials(user.name)}
          </div>
        )}
        {!collapsed && (
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-white">{user.name}</span>
            <span className="truncate text-xs text-slate-400">{user.role}</span>
          </div>
        )}
        {!collapsed && onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            title="Sair"
            className="shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  )
}
