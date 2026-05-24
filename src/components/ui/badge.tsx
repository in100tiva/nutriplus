import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant =
  | 'default'
  | 'accent'
  | 'clay'
  | 'warn'
  | 'warning'
  | 'info'
  | 'solid'
  | 'success'
  | 'danger'
  | 'secondary'
export type BadgeSize = 'sm' | 'md'

const variantClass: Record<BadgeVariant, string> = {
  default: '',
  secondary: '',
  accent: 'accent',
  success: 'accent',
  clay: 'clay',
  warn: 'warn',
  warning: 'warn',
  danger: 'warn',
  info: 'info',
  solid: 'solid',
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  children: ReactNode
}

export function Badge({ className, variant = 'default', size = 'sm', ...props }: BadgeProps) {
  return (
    <span
      className={cn('chip', variantClass[variant], className)}
      style={size === 'md' ? { padding: '3px 10px', fontSize: 12.5 } : undefined}
      {...props}
    />
  )
}
