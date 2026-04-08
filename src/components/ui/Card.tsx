import type { PropsWithChildren } from 'react'
import { View } from '@tarojs/components'
import { cn } from '@/components/ui/cn'

interface CardProps extends PropsWithChildren {
  className?: string
}

export function Card({ className, children }: CardProps) {
  return (
    <View className={cn('rounded-anthropic border border-content/[0.08] bg-surface-white shadow-card', className)}>
      {children}
    </View>
  )
}

export function CardContent({ className, children }: CardProps) {
  return <View className={cn('p-5', className)}>{children}</View>
}

export function CardHeader({ className, children }: CardProps) {
  return <View className={cn('px-5 pt-5', className)}>{children}</View>
}
