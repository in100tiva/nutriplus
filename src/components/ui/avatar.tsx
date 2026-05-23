import type { HTMLAttributes } from 'react'
import { cn, getInitials } from '@/lib/utils'

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'
export type AvatarTone = 'accent' | 'clay' | 'slate' | 'warm'

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  nome?: string
  iniciais?: string
  url?: string | null
  size?: AvatarSize
  tone?: AvatarTone
}

const sizeClass: Record<AvatarSize, string> = { sm: 'sm', md: '', lg: 'lg', xl: 'xl' }

export function Avatar({ nome, iniciais, url, size = 'md', tone, className, ...props }: AvatarProps) {
  const label = iniciais ?? (nome ? getInitials(nome) : '?')
  if (url) {
    return (
      <img
        src={url}
        alt={nome ?? 'avatar'}
        className={cn('ava', sizeClass[size], className)}
        style={{ objectFit: 'cover' }}
      />
    )
  }
  return (
    <div className={cn('ava', sizeClass[size], tone, className)} {...props}>
      {label}
    </div>
  )
}
