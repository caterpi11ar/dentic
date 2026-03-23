import { View, Text } from '@tarojs/components'
import type { PropsWithChildren } from 'react'
import { cn } from '@/components/ui/cn'

type Variant = 'default' | 'secondary' | 'outline' | 'success' | 'warning'

const VARIANT_CLASS: Record<Variant, string> = {
  default: 'bg-primary/15 text-primary border border-primary/25',
  secondary: 'bg-surface text-content-secondary border border-line',
  outline: 'bg-transparent text-content-secondary border border-line',
  success: 'bg-success-light text-success-text border border-success/30',
  warning: 'bg-warning-light text-warning border border-warning/30',
}

interface BadgeProps extends PropsWithChildren {
  className?: string
  variant?: Variant
}

export default function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <View className={cn('rounded-full px-2.5 py-1', VARIANT_CLASS[variant], className)}>
      <Text className="text-xs font-medium">{children}</Text>
    </View>
  )
}
