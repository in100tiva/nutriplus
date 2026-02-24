import { useState, useCallback, type KeyboardEvent } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── Types ───────────────────────────────────────────────────── */

export type StarRatingSize = 'sm' | 'md' | 'lg'

const sizeStyles: Record<StarRatingSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export interface StarRatingProps {
  /** Current rating value (0-5, supports decimals for display mode) */
  value: number
  /** Maximum number of stars */
  max?: number
  /** Callback when user clicks a star (makes it interactive) */
  onChange?: (value: number) => void
  /** Size of the stars */
  size?: StarRatingSize
  /** Read-only mode (no interaction, supports half-stars) */
  readOnly?: boolean
  className?: string
}

/* ─── StarRating ──────────────────────────────────────────────── */

function StarRating({
  value,
  max = 5,
  onChange,
  size = 'md',
  readOnly = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const isInteractive = !readOnly && !!onChange

  const handleClick = useCallback(
    (starIndex: number) => {
      if (isInteractive) onChange?.(starIndex)
    },
    [isInteractive, onChange],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, starIndex: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick(starIndex)
      }
    },
    [handleClick],
  )

  const displayValue = isInteractive && hoverValue !== null ? hoverValue : value

  return (
    <div
      className={cn('inline-flex items-center gap-0.5', className)}
      role={isInteractive ? 'radiogroup' : 'img'}
      aria-label={`Avaliação: ${value} de ${max} estrelas`}
    >
      {Array.from({ length: max }, (_, i) => {
        const starIndex = i + 1
        const fillPercent = Math.min(1, Math.max(0, displayValue - i))

        return (
          <StarIcon
            key={i}
            fillPercent={fillPercent}
            sizeClass={sizeStyles[size]}
            interactive={isInteractive}
            isSelected={starIndex <= displayValue}
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => isInteractive && setHoverValue(starIndex)}
            onMouseLeave={() => isInteractive && setHoverValue(null)}
            onKeyDown={(e) => handleKeyDown(e, starIndex)}
            ariaLabel={`${starIndex} estrela${starIndex > 1 ? 's' : ''}`}
          />
        )
      })}
    </div>
  )
}

StarRating.displayName = 'StarRating'

/* ─── StarIcon (internal) ─────────────────────────────────────── */

interface StarIconProps {
  fillPercent: number
  sizeClass: string
  interactive: boolean
  isSelected: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void
  ariaLabel: string
}

function StarIcon({
  fillPercent,
  sizeClass,
  interactive,
  isSelected,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onKeyDown,
  ariaLabel,
}: StarIconProps) {
  const isFull = fillPercent >= 1
  const isHalf = fillPercent > 0 && fillPercent < 1
  const isEmpty = fillPercent <= 0

  // Generate a unique clip-path ID for half-stars
  const clipId = `star-clip-${Math.random().toString(36).slice(2, 9)}`

  const starElement = (
    <span className="relative inline-flex">
      {/* Empty star (background) */}
      <Star
        className={cn(
          sizeClass,
          isEmpty ? 'text-gray-300' : 'text-yellow-400',
          isFull && 'fill-yellow-400',
        )}
      />

      {/* Half-star overlay using clip-path */}
      {isHalf && (
        <>
          <svg className="absolute h-0 w-0">
            <defs>
              <clipPath id={clipId}>
                <rect x="0" y="0" width={`${fillPercent * 100}%`} height="100%" />
              </clipPath>
            </defs>
          </svg>
          <Star
            className={cn(sizeClass, 'absolute inset-0 fill-yellow-400 text-yellow-400')}
            style={{ clipPath: `url(#${clipId})` }}
          />
        </>
      )}
    </span>
  )

  if (interactive) {
    return (
      <button
        type="button"
        role="radio"
        aria-checked={isSelected}
        aria-label={ariaLabel}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onKeyDown={onKeyDown}
        className={cn(
          'cursor-pointer rounded-sm transition-transform',
          'hover:scale-110',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
        )}
      >
        {starElement}
      </button>
    )
  }

  return starElement
}

export { StarRating }
