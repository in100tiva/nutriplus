import type { ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { Header, type Crumb } from './header'
import type { UserRole } from '@/types'

interface ShellUser {
  name: string
  avatarUrl?: string
  sub?: string
}

export interface DashboardShellProps {
  role: UserRole
  user: ShellUser
  crumbs?: Crumb[]
  onSignOut?: () => void
  children: ReactNode
}

export function DashboardShell({ role, user, crumbs, onSignOut, children }: DashboardShellProps) {
  return (
    <div className="app">
      <Sidebar role={role} user={user} onSignOut={onSignOut} />
      <div className="main">
        <Header crumbs={crumbs} />
        <div className="content">{children}</div>
      </div>
    </div>
  )
}
