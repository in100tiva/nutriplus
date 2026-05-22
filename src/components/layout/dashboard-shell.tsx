import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'
import { Header } from './header'

interface DashboardUser {
  name: string
  avatarUrl?: string
  role: string
}

export interface DashboardShellProps {
  role: 'nutricionista' | 'paciente' | 'admin'
  user: DashboardUser
  title?: string
  perfilHref?: string
  onSignOut?: () => void
  children: React.ReactNode
}

export function DashboardShell({
  role,
  user,
  title,
  perfilHref,
  onSignOut,
  children,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    if (mobileOpen) {
      document.addEventListener('keydown', onEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.removeEventListener('keydown', onEscape)
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const toggleMobile = useCallback(() => setMobileOpen((p) => !p), [])
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar role={role} user={user} collapsed={false} onSignOut={onSignOut} />
      </div>

      <div className="hidden lg:block">
        <Sidebar
          role={role}
          user={user}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          onSignOut={onSignOut}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title={title}
          user={user}
          perfilHref={perfilHref}
          onMenuToggle={toggleMobile}
          onSignOut={onSignOut}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
