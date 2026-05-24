import { useToast } from '@/hooks/use-toast'
import { IconX, IconCheck } from '@/components/icons'

export function ToastContainer() {
  const toasts = useToast((s) => s.toasts)
  const remove = useToast((s) => s.removeToast)
  if (toasts.length === 0) return null
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 380,
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onClose={() => remove(t.id)} />
      ))}
    </div>
  )
}

interface ItemProps {
  id: string
  title: string
  description?: string
  type: 'success' | 'error' | 'warning' | 'info'
  onClose: () => void
}

const colorByType: Record<ItemProps['type'], string> = {
  success: 'var(--accent)',
  error: 'var(--danger)',
  warning: 'var(--warn)',
  info: 'var(--info)',
}

export function ToastItem({ title, description, type, onClose }: ItemProps) {
  return (
    <div
      className="fade-up"
      style={{
        background: 'var(--paper-3)',
        border: '0.5px solid var(--line)',
        borderLeft: `3px solid ${colorByType[type]}`,
        borderRadius: 10,
        padding: '12px 14px',
        display: 'flex',
        gap: 10,
        boxShadow: 'var(--shadow-2)',
      }}
    >
      <div style={{ color: colorByType[type], marginTop: 1 }}>
        {type === 'success' ? <IconCheck /> : <IconX />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{title}</div>
        {description && (
          <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
            {description}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="icon-btn"
        style={{ width: 24, height: 24, border: 0, background: 'transparent' }}
        aria-label="Fechar"
      >
        <IconX />
      </button>
    </div>
  )
}
