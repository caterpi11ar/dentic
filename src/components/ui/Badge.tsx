import type { PropsWithChildren } from 'react'
import { Text, View } from '@tarojs/components'
import { cn } from '@/components/ui/cn'

type Variant = 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'info'

const VARIANT_CLASS: Record<Variant, string> = {
  default: 'bg-primary/10 text-primary border border-primary/15',
  secondary: 'bg-content/[0.04] text-content/60 border border-content/[0.08]',
  outline: 'bg-transparent text-content/60 border border-content/[0.12]',
  success: 'bg-success-light text-success-text border border-success/20',
  warning: 'bg-warning-light text-warning border border-warning/20',
  info: 'bg-info-light text-info-dark border border-info/20',
}

interface BadgeProps extends PropsWithChildren {
  className?: string
  variant?: Variant
}

export default function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <View className={cn('rounded-anthropic-sm px-2.5 py-1', VARIANT_CLASS[variant], className)}>
      <Text className="text-label-xs font-body font-medium tracking-wide">{children}</Text>
    </View>
  )
}
