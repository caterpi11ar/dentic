import type { PropsWithChildren, ReactNode } from 'react'
import { View } from '@tarojs/components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
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
    <Card className={className}>
      {hasHeader && (
        <CardHeader className="pb-2">
          <View className="flex items-start justify-between gap-3">
            <View className="min-w-0">
              {title && <CardTitle className="text-paragraph-sm">{title}</CardTitle>}
              {description && <CardDescription className="text-content-tertiary">{description}</CardDescription>}
            </View>
            {headerRight ? <View className="shrink-0">{headerRight}</View> : null}
          </View>
        </CardHeader>
      )}
      <CardContent className={cn(hasHeader ? 'pt-0' : undefined, bodyClassName)}>{children}</CardContent>
    </Card>
  )
}
