import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  FileText,
  FileInput,
  CheckSquare,
  MessageSquare,
  FolderOpen,
  Star,
  Building2,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

interface SidebarUser {
  name: string
  avatarUrl?: string
  role: string
}

export interface SidebarProps {
  role: 'professional' | 'patient'
  user: SidebarUser
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  onSignOut?: () => void
}

// ─── Navigation definitions ─────────────────────────────────────

const professionalNav: NavItem[] = [
  { label: 'Dashboard', href: '/pro', icon: LayoutDashboard },
  { label: 'Pacientes', href: '/pro/patients', icon: Users },
  { label: 'Consultas', href: '/pro/appointments', icon: Calendar },
  { label: 'Prontuários', href: '/pro/records', icon: FileText },
  { label: 'Formulários', href: '/pro/forms', icon: FileInput },
  { label: 'Tarefas', href: '/pro/tasks', icon: CheckSquare },
  { label: 'Mensagens', href: '/pro/messages', icon: MessageSquare, badge: 0 },
  { label: 'Documentos', href: '/pro/documents', icon: FolderOpen },
  { label: 'Avaliações', href: '/pro/reviews', icon: Star },
  { label: 'Consultório', href: '/pro/organization', icon: Building2 },
  { label: 'Configurações', href: '/pro/settings', icon: Settings },
]

const patientNav: NavItem[] = [
  { label: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { label: 'Buscar Profissional', href: '/app/search', icon: Search },
  { label: 'Minhas Consultas', href: '/app/appointments', icon: Calendar },
  { label: 'Meus Prontuários', href: '/app/records', icon: FileText },
  { label: 'Minhas Tarefas', href: '/app/tasks', icon: CheckSquare },
  { label: 'Mensagens', href: '/app/messages', icon: MessageSquare, badge: 0 },
  { label: 'Documentos', href: '/app/documents', icon: FolderOpen },
  { label: 'Configurações', href: '/app/settings', icon: Settings },
]

// ─── Component ──────────────────────────────────────────────────

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

  const navItems = role === 'professional' ? professionalNav : patientNav

  const isActive = (href: string) => {
    if (href === '/pro' || href === '/app') {
      return location.pathname === href
    }
    return location.pathname.startsWith(href)
  }

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-slate-900 text-white transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      {/* Logo area */}
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-slate-700/50 px-4',
          collapsed ? 'justify-center' : 'gap-3'
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-sm font-bold text-white">
          M
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold tracking-tight">
            MedHub
          </span>
        )}
      </div>

      {/* Navigation */}
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
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                    active
                      ? 'bg-sky-500/15 text-sky-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                    collapsed && 'justify-center px-0'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      active
                        ? 'text-sky-400'
                        : 'text-slate-400 group-hover:text-white'
                    )}
                  />

                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}

                  {/* Unread badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={cn(
                        'flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-semibold text-white',
                        collapsed
                          ? 'absolute -right-0.5 -top-0.5'
                          : 'ml-auto'
                      )}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}

                  {/* Active indicator */}
                  {active && (
                    <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-sky-400" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-slate-700/50 px-2 py-2">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
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

      {/* User info */}
      <div
        className={cn(
          'flex shrink-0 items-center border-t border-slate-700/50 p-3',
          collapsed ? 'justify-center' : 'gap-3'
        )}
      >
        {/* Avatar */}
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
            <span className="truncate text-sm font-medium text-white">
              {user.name}
            </span>
            <span className="truncate text-xs text-slate-400">
              {user.role}
            </span>
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
