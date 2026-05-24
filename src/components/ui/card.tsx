import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'default' | 'flush' | 'warm' | 'dark'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div ref={ref} className={cn('card', variant !== 'default' && variant, className)} {...props} />
  ),
)
Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('sec', className)} {...props} />
  ),
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h3 ref={ref} className={cn('serif', className)} style={{ fontWeight: 500, fontSize: 18, letterSpacing: '-0.01em' }} {...props} />,
)
CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('muted', className)} style={{ fontSize: 12.5 }} {...props} />
  ),
)
CardDescription.displayName = 'CardDescription'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={className} {...props} />,
)
CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}
      {...props}
    />
  ),
)
CardFooter.displayName = 'CardFooter'
