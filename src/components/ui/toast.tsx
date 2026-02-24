import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast, type Toast, type ToastType } from '@/hooks/use-toast'

/* ─── Style maps ──────────────────────────────────────────────── */

const typeStyles: Record<ToastType, string> = {
  success: 'border-green-200 bg-green-50',
  error: 'border-red-200 bg-red-50',
  warning: 'border-yellow-200 bg-yellow-50',
  info: 'border-blue-200 bg-blue-50',
}

const typeIconStyles: Record<ToastType, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
}

const typeIcons: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

/* ─── ToastItem ───────────────────────────────────────────────── */

interface ToastItemProps {
  toast: Toast
  onClose: (id: string) => void
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setVisible(true)
      })
    })
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => onClose(toast.id), 200)
  }

  const Icon = typeIcons[toast.type]

  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto flex w-80 items-start gap-3 rounded-lg border p-4 shadow-lg',
        'transition-all duration-200',
        visible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0',
        typeStyles[toast.type],
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', typeIconStyles[toast.type])} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-sm text-gray-600">{toast.description}</p>
        )}
      </div>

      <button
        type="button"
        onClick={handleClose}
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-md p-0.5 text-gray-400',
          'transition-colors hover:text-gray-600',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
        )}
        aria-label="Fechar notificação"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

/* ─── ToastContainer ──────────────────────────────────────────── */

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return createPortal(
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-label="Notificações"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={removeToast} />
      ))}
    </div>,
    document.body,
  )
}

ToastContainer.displayName = 'ToastContainer'

export { ToastContainer, ToastItem }
