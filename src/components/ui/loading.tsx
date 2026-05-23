import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type SpinnerSize = 'sm' | 'md' | 'lg'
const sizeMap: Record<SpinnerSize, number> = { sm: 14, md: 20, lg: 28 }

export interface SpinnerProps {
  size?: SpinnerSize
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const s = sizeMap[size]
  return (
    <svg
      className={className}
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{ color: 'var(--ink-3)' }}
    >
      <circle cx="12" cy="12" r="9" strokeOpacity="0.2" />
      <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  )
}

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  label?: string
}

export function Loading({ label = 'Carregando…', className, ...props }: LoadingProps) {
  return (
    <div
      className={cn(className)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: 20,
        color: 'var(--ink-3)',
        fontSize: 13,
      }}
      {...props}
    >
      <Spinner />
      <span>{label}</span>
    </div>
  )
}

export interface LoadingOverlayProps {
  label?: string
}

export function LoadingOverlay({ label }: LoadingOverlayProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        background: 'color-mix(in oklch, var(--paper) 70%, transparent)',
        backdropFilter: 'blur(2px)',
        zIndex: 10,
      }}
    >
      <Loading label={label} />
    </div>
  )
}
