import type { VariantProps } from 'class-variance-authority'
import type { PropsWithChildren } from 'react'
import { Text, View } from '@tarojs/components'
import { cva } from 'class-variance-authority'
import { cn } from '@/components/ui/cn'

const alertVariants = cva(
  'relative w-full rounded-anthropic border px-4 py-3 text-paragraph-sm',
  {
    variants: {
      variant: {
        default: 'border-content/[0.08] bg-surface-white text-content',
        destructive: 'border-danger/30 bg-danger/5 text-danger',
        warning: 'border-warning/30 bg-warning-light/50 text-content',
        success: 'border-success/30 bg-success-light/50 text-content',
        info: 'border-info/30 bg-info-light/50 text-content',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Alert({
  className,
  variant,
  children,
  ...props
}: PropsWithChildren<{ className?: string } & VariantProps<typeof alertVariants> & { 'role'?: string, 'aria-live'?: string }>) {
  return (
    <View
      role="alert"
      aria-live="polite"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {children}
    </View>
  )
}

function AlertTitle({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <Text
      className={cn(
        'block font-body font-semibold text-label-xs tracking-wide uppercase text-content-tertiary',
        className,
      )}
    >
      {children}
    </Text>
  )
}

function AlertDescription({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <Text
      className={cn(
        'block mt-1.5 text-paragraph-sm font-body text-content-secondary leading-relaxed',
        className,
      )}
    >
      {children}
    </Text>
  )
}

export { Alert, AlertDescription, AlertTitle, alertVariants }
