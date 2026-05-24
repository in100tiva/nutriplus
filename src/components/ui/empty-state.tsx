import type { ReactNode } from 'react'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={className}
      style={{
        textAlign: 'center',
        padding: '32px 20px',
        color: 'var(--ink-3)',
      }}
    >
      {icon && (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'var(--paper-2)',
            border: '0.5px solid var(--line)',
            color: 'var(--ink-3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
          }}
        >
          {icon}
        </div>
      )}
      <h3 style={{ color: 'var(--ink)', fontSize: 15, fontWeight: 600 }}>{title}</h3>
      {description && (
        <p style={{ fontSize: 13, marginTop: 4, maxWidth: 380, marginInline: 'auto' }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  )
}
