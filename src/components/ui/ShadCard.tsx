import { View } from '@tarojs/components'
import type { PropsWithChildren } from 'react'

interface CardProps extends PropsWithChildren {
  className?: string
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(' ')
}

export function ShadCard({ className, children }: CardProps) {
  return (
    <View className={cx('rounded-2xl border border-line bg-surface-white shadow-card', className)}>
      {children}
    </View>
  )
}

export function ShadCardContent({ className, children }: CardProps) {
  return <View className={cx('p-4', className)}>{children}</View>
}

export function ShadCardHeader({ className, children }: CardProps) {
  return <View className={cx('px-4 pt-4', className)}>{children}</View>
}
