import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type ButtonVariant =
  | 'default'
  | 'primary'
  | 'accent'
  | 'ghost'
  | 'danger'
  | 'outline'
  | 'secondary'
export type ButtonSize = 'sm' | 'md' | 'lg'

// `outline` e `secondary` são aliases do default (que já tem borda) para compat
// com o código existente.
const variantClass: Record<ButtonVariant, string> = {
  default: '',
  outline: '',
  secondary: '',
  primary: 'primary',
  accent: 'accent',
  ghost: 'ghost',
  danger: 'danger',
}
const sizeClass: Record<ButtonSize, string> = { sm: 'sm', md: '', lg: 'lg' }

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading, disabled, children, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn('btn', variantClass[variant], sizeClass[size], className)}
        {...props}
      >
        {loading && (
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
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
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
