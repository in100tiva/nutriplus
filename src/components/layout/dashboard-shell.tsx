import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'
import { Header } from './header'

// ─── Types ──────────────────────────────────────────────────────

interface DashboardUser {
  name: string
  avatarUrl?: string
  role: string
}

export interface DashboardShellProps {
  role: 'professional' | 'patient'
  user: DashboardUser
  title?: string
  notificationCount?: number
  onSignOut?: () => void
  children: React.ReactNode
}

// ─── Component ──────────────────────────────────────────────────

export function DashboardShell({
  role,
  user,
  title,
  notificationCount = 0,
  onSignOut,
  children,
}: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile sidebar on route change / escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileOpen(false)
      }
    }

    if (mobileOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when mobile sidebar is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const handleMenuToggle = useCallback(() => {
    setMobileOpen((prev) => !prev)
  }, [])

  const handleMobileClose = useCallback(() => {
    setMobileOpen(false)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={handleMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar
          role={role}
          user={user}
          collapsed={false}
          onSignOut={onSignOut}
        />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          role={role}
          user={user}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          onSignOut={onSignOut}
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title={title}
          user={user}
          notificationCount={notificationCount}
          onMenuToggle={handleMenuToggle}
          onSignOut={onSignOut}
        />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
