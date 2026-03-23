import { View } from '@tarojs/components'
import type { PropsWithChildren } from 'react'
import { cn } from '@/components/ui/cn'

interface CardProps extends PropsWithChildren {
  className?: string
}

export function Card({ className, children }: CardProps) {
  return (
    <View className={cn('rounded-2xl border border-line bg-surface-white shadow-card', className)}>
      {children}
    </View>
  )
}

export function CardContent({ className, children }: CardProps) {
  return <View className={cn('p-4', className)}>{children}</View>
}

export function CardHeader({ className, children }: CardProps) {
  return <View className={cn('px-4 pt-4', className)}>{children}</View>
}
