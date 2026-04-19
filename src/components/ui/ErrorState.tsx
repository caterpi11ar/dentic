import type { ReactNode } from 'react'
import { Text, View } from '@tarojs/components'
import Button from '@/components/ui/Button'
import { cn } from '@/components/ui/cn'

interface ErrorStateProps {
  icon?: ReactNode
  title: string
  description?: string
  retryLabel?: string
  onRetry?: () => void
  className?: string
}

export default function ErrorState({
  icon,
  title,
  description,
  retryLabel = '重试',
  onRetry,
  className,
}: ErrorStateProps) {
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
      {onRetry ? (
        <View className="mt-2">
          <Button variant="ghost" size="sm" fullWidth={false} onClick={onRetry}>
            {retryLabel}
          </Button>
        </View>
      ) : null}
    </View>
  )
}
