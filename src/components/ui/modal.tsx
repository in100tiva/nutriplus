import {
  forwardRef,
  useEffect,
  useCallback,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type MouseEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── Types ───────────────────────────────────────────────────── */

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export interface ModalProps {
  open: boolean
  onClose: () => void
  size?: ModalSize
  children: ReactNode
  className?: string
  /** When true the backdrop click will NOT close the modal */
  persistent?: boolean
}

/* ─── Modal (root) ────────────────────────────────────────────── */

function Modal({ open, onClose, size = 'md', children, className, persistent = false }: ModalProps) {
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)

  // Open animation
  useEffect(() => {
    if (open) {
      setVisible(true)
      // Trigger enter transition on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimating(true)
        })
      })
    } else {
      setAnimating(false)
      const timer = setTimeout(() => setVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [open])

  // ESC key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!persistent && e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!visible) return null

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'transition-colors duration-200',
        animating ? 'bg-black/50' : 'bg-black/0',
      )}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={cn(
          'relative w-full rounded-lg bg-white shadow-xl',
          'transition-all duration-200',
          animating ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          sizeStyles[size],
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}

Modal.displayName = 'Modal'

/* ─── ModalHeader ─────────────────────────────────────────────── */

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  onClose?: () => void
}

const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, children, onClose, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between border-b border-gray-200 p-6', className)}
      {...props}
    >
      <div className="flex flex-col gap-1">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'inline-flex items-center justify-center rounded-lg p-1 text-gray-400',
            'transition-colors hover:bg-gray-100 hover:text-gray-600',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
          )}
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  ),
)
ModalHeader.displayName = 'ModalHeader'

/* ─── ModalTitle ──────────────────────────────────────────────── */

const ModalTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold text-gray-900', className)}
      {...props}
    />
  ),
)
ModalTitle.displayName = 'ModalTitle'

/* ─── ModalDescription ────────────────────────────────────────── */

const ModalDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-500', className)}
      {...props}
    />
  ),
)
ModalDescription.displayName = 'ModalDescription'

/* ─── ModalBody ───────────────────────────────────────────────── */

const ModalBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6', className)}
      {...props}
    />
  ),
)
ModalBody.displayName = 'ModalBody'

/* ─── ModalFooter ─────────────────────────────────────────────── */

const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-end gap-3 border-t border-gray-200 p-6', className)}
      {...props}
    />
  ),
)
ModalFooter.displayName = 'ModalFooter'

export { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter }
