import type { ReactNode } from 'react'
import { Text, View } from '@tarojs/components'
import { cn } from '@/components/ui/cn'

interface PageHeaderProps {
  title: string
  description?: string
  right?: ReactNode
  className?: string
}

export default function PageHeader({ title, description, right, className }: PageHeaderProps) {
  return (
    <View className={cn('mb-page-gap flex items-start justify-between gap-3', className)}>
      <View className="min-w-0">
        <Text
          className="block text-display-md font-body font-semibold tracking-tight text-content"
          aria-label={title}
        >
          {title}
        </Text>
        {description && (
          <Text className="mt-1.5 block text-paragraph-sm text-content-secondary">
            {description}
          </Text>
        )}
      </View>
      {right ? <View className="shrink-0">{right}</View> : null}
    </View>
  )
}
