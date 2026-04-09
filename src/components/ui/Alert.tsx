import type { PropsWithChildren } from 'react'
import { Text, View } from '@tarojs/components'
import { cn } from '@/components/ui/cn'

type AlertVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

const VARIANT_CLASS: Record<AlertVariant, string> = {
  default: 'border-content/[0.08] bg-surface-white',
  success: 'border-success/30 bg-success-light/50',
  warning: 'border-warning/30 bg-warning-light/50',
  danger: 'border-danger/30 bg-danger/5',
  info: 'border-info/30 bg-info-light/50',
}

export interface AlertProps extends PropsWithChildren {
  className?: string
  variant?: AlertVariant
  title?: string
  description?: string
  onClose?: () => void
}

export default function Alert({
  variant = 'default',
  title,
  description,
  className,
  children,
  onClose,
}: AlertProps) {
  return (
    <View
      className={cn(
        'rounded-anthropic border px-3.5 py-3',
        VARIANT_CLASS[variant],
        className,
      )}
      role="alert"
      aria-live="polite"
    >
      <View className="flex items-start justify-between gap-2">
        <View className="flex-1 min-w-0">
          {title && (
            <Text className="block text-label-xs font-body font-semibold tracking-wide text-content-tertiary uppercase">
              {title}
            </Text>
          )}
          {description && (
            <Text className={cn('block text-paragraph-sm font-body text-content-secondary leading-relaxed', title && 'mt-1.5')}>
              {description}
            </Text>
          )}
          {children}
        </View>
        {onClose && (
          <View
            className="shrink-0 size-6 flex items-center justify-center rounded-full"
            role="button"
            aria-label="关闭"
            onClick={onClose}
          >
            <Text className="text-label-sm text-content-tertiary">×</Text>
          </View>
        )}
      </View>
    </View>
  )
}
