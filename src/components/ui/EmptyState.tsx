import type { ReactNode } from 'react'
import { Text, View } from '@tarojs/components'
import { cn } from '@/components/ui/cn'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <View
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-10 gap-3',
        className,
      )}
    >
      {icon ? (
        <View className="size-12 flex items-center justify-center text-content-tertiary">
          {icon}
        </View>
      ) : null}
      <Text className="text-paragraph-md font-body font-semibold text-content">{title}</Text>
      {description ? (
        <Text className="text-paragraph-sm text-content-tertiary leading-relaxed max-w-xs">
          {description}
        </Text>
      ) : null}
      {action ? <View className="mt-2">{action}</View> : null}
    </View>
  )
}
