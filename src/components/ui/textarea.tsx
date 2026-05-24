import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  wrapperClassName?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, wrapperClassName, id, rows = 3, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    return (
      <div className={cn('field', wrapperClassName)}>
        {label && <label htmlFor={inputId}>{label}</label>}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={cn('input', className)}
          style={{ height: 'auto', padding: '8px 10px', lineHeight: 1.5, resize: 'vertical' }}
          {...props}
        />
        {error && <p className="err">{error}</p>}
        {!error && helperText && (
          <p style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{helperText}</p>
        )}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
