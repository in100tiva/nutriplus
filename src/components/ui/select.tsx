import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { IconChevD } from '@/components/icons'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  wrapperClassName?: string
  children: ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, wrapperClassName, id, children, ...props }, ref) => {
    const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    return (
      <div className={cn('field', wrapperClassName)}>
        {label && <label htmlFor={selectId}>{label}</label>}
        <div style={{ position: 'relative' }}>
          <select
            ref={ref}
            id={selectId}
            className={cn('input', className)}
            style={{ paddingRight: 30, appearance: 'none' }}
            aria-invalid={error ? 'true' : undefined}
            {...props}
          >
            {children}
          </select>
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
            <IconChevD />
          </span>
        </div>
        {error && <p className="err">{error}</p>}
      </div>
    )
  },
)
Select.displayName = 'Select'
