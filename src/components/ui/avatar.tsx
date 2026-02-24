import { useState } from 'react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'
export type AvatarStatus = 'online' | 'offline'

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

const statusSizeStyles: Record<AvatarSize, string> = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-3.5 w-3.5',
}

export interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: AvatarSize
  status?: AvatarStatus
  className?: string
}

function Avatar({ src, alt, name = '', size = 'md', status, className }: AvatarProps) {
  const [imgError, setImgError] = useState(false)
  const showImage = src && !imgError
  const initials = getInitials(name)

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-full bg-blue-100 font-medium text-blue-600',
          sizeStyles[size],
        )}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt ?? name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span aria-label={name || undefined}>{initials}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white',
            statusSizeStyles[size],
            status === 'online' ? 'bg-green-500' : 'bg-gray-400',
          )}
          aria-label={status === 'online' ? 'Online' : 'Offline'}
        />
      )}
    </div>
  )
}

Avatar.displayName = 'Avatar'

export { Avatar }
