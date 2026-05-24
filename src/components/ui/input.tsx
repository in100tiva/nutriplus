import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  wrapperClassName?: string
  inputSize?: 'md' | 'lg'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, wrapperClassName, id, inputSize = 'md', style, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    return (
      <div className={cn('field', wrapperClassName)}>
        {label && <label htmlFor={inputId}>{label}</label>}
        <div style={{ position: 'relative' }}>
          {leftIcon && (
            <span
              style={{
                position: 'absolute',
                left: 10,
                top: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                color: 'var(--ink-3)',
                pointerEvents: 'none',
              }}
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input',
              inputSize === 'lg' && 'lg',
              error && 'border-[color:var(--danger)] focus:border-[color:var(--danger)]',
              className,
            )}
            style={{
              ...style,
              ...(leftIcon ? { paddingLeft: 32 } : {}),
              ...(rightIcon ? { paddingRight: 32 } : {}),
            }}
            aria-invalid={error ? 'true' : undefined}
            {...props}
          />
          {rightIcon && (
            <span
              style={{
                position: 'absolute',
                right: 10,
                top: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                color: 'var(--ink-3)',
                pointerEvents: 'none',
              }}
            >
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="err">{error}</p>}
        {!error && helperText && (
          <p style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{helperText}</p>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'
