import { View, Text } from '@tarojs/components'
import type { PropsWithChildren, ReactNode } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { cn } from '@/components/ui/cn'

interface SectionProps extends PropsWithChildren {
  className?: string
  bodyClassName?: string
  title?: string
  description?: string
  headerRight?: ReactNode
}

export default function Section({
  className,
  bodyClassName,
  title,
  description,
  headerRight,
  children,
}: SectionProps) {
  const hasHeader = !!title || !!description || !!headerRight

  return (
    <Card className={cn('rounded-2xl', className)}>
      {hasHeader && (
        <CardHeader className="pb-2.5">
          <View className="flex items-start justify-between gap-3">
            <View className="min-w-0">
              {title && <Text className="text-sm font-heading font-bold tracking-[0.08em] text-content-secondary">{title}</Text>}
              {description && <Text className="mt-1 text-sm text-content-tertiary">{description}</Text>}
            </View>
            {headerRight ? <View className="shrink-0">{headerRight}</View> : null}
          </View>
        </CardHeader>
      )}
      <CardContent className={cn(hasHeader ? 'pt-0' : undefined, bodyClassName)}>{children}</CardContent>
    </Card>
  )
}
