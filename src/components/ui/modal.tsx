import { useEffect, useState, type HTMLAttributes, type ReactNode, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { IconX } from '@/components/icons'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

const sizeMap: Record<ModalSize, number> = { sm: 380, md: 520, lg: 680, xl: 880 }

export interface ModalProps {
  open: boolean
  onClose: () => void
  size?: ModalSize
  children: ReactNode
  className?: string
  persistent?: boolean
}

export function Modal({ open, onClose, size = 'md', children, className, persistent }: ModalProps) {
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (open) {
      setVisible(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimating(true)))
    } else {
      setAnimating(false)
      const t = setTimeout(() => setVisible(false), 200)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !persistent) onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, persistent, onClose])

  if (!visible) return null

  const handleBackdrop = (e: MouseEvent<HTMLDivElement>) => {
    if (!persistent && e.target === e.currentTarget) onClose()
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="scrim"
      onClick={handleBackdrop}
      style={{
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        background: animating ? 'rgba(20,15,10,.32)' : 'rgba(20,15,10,0)',
        transition: 'background .2s ease',
      }}
    >
      <div
        className={cn(className)}
        style={{
          width: '100%',
          maxWidth: sizeMap[size],
          background: 'var(--paper-3)',
          border: '0.5px solid var(--line)',
          borderRadius: 14,
          boxShadow: 'var(--shadow-3)',
          transform: animating ? 'scale(1)' : 'scale(0.96)',
          opacity: animating ? 1 : 0,
          transition: 'transform .2s, opacity .2s',
          maxHeight: 'calc(100vh - 32px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  onClose?: () => void
}

export function ModalHeader({ className, children, onClose, ...props }: ModalHeaderProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '18px 22px',
        borderBottom: '0.5px solid var(--line)',
      }}
      {...props}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>{children}</div>
      {onClose && (
        <button className="icon-btn" onClick={onClose} aria-label="Fechar">
          <IconX />
        </button>
      )}
    </div>
  )
}

export function ModalTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn('serif', className)} style={{ fontSize: 21, fontWeight: 500 }} {...props}>
      {children}
    </h2>
  )
}

export function ModalDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('muted', className)} style={{ fontSize: 12.5 }} {...props} />
}

export function ModalBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} style={{ padding: 22, overflowY: 'auto', minHeight: 0 }} {...props} />
  )
}

export function ModalFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        padding: '14px 22px',
        borderTop: '0.5px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        background: 'var(--paper-2)',
      }}
      {...props}
    />
  )
}
