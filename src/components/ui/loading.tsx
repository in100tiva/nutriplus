import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── Spinner ─────────────────────────────────────────────────── */

export type SpinnerSize = 'sm' | 'md' | 'lg'

const spinnerSizeStyles: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export interface SpinnerProps {
  size?: SpinnerSize
  className?: string
}

function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-blue-500', spinnerSizeStyles[size], className)}
      aria-label="Carregando"
    />
  )
}

Spinner.displayName = 'Spinner'

/* ─── Loading ─────────────────────────────────────────────────── */

export interface LoadingProps {
  label?: string
  size?: SpinnerSize
  className?: string
}

function Loading({ label = 'Carregando...', size = 'md', className }: LoadingProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 py-12', className)}
      role="status"
    >
      <Spinner size={size} />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  )
}

Loading.displayName = 'Loading'

/* ─── LoadingOverlay ──────────────────────────────────────────── */

export interface LoadingOverlayProps {
  label?: string
  className?: string
}

function LoadingOverlay({ label = 'Carregando...', className }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm',
        className,
      )}
      role="status"
    >
      <Spinner size="lg" />
      {label && <p className="mt-3 text-sm font-medium text-gray-600">{label}</p>}
    </div>
  )
}

LoadingOverlay.displayName = 'LoadingOverlay'

export { Spinner, Loading, LoadingOverlay }
