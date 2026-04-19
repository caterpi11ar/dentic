import type { PropsWithChildren, ReactNode } from 'react'
import { Text, View } from '@tarojs/components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/components/ui/cn'

interface SectionProps extends PropsWithChildren {
  variant?: 'card' | 'group'
  className?: string
  bodyClassName?: string
  title?: string
  description?: string
  label?: string
  headerRight?: ReactNode
  dense?: boolean
  flush?: boolean
}

export default function Section({
  variant = 'card',
  className,
  bodyClassName,
  title,
  description,
  label,
  headerRight,
  dense = false,
  flush = false,
  children,
}: SectionProps) {
  if (variant === 'group') {
    return (
      <View className={cn('space-y-4', className)}>
        {(label || headerRight) && (
          <View className="flex items-center gap-3">
            {label && (
              <Text className="text-label-sm uppercase text-content-tertiary shrink-0">
                {label}
              </Text>
            )}
            <View className="flex-1 h-px bg-line" />
            {headerRight ? <View className="shrink-0">{headerRight}</View> : null}
          </View>
        )}
        <View className={bodyClassName}>{children}</View>
      </View>
    )
  }

  const hasHeader = !!title || !!description || !!headerRight
  const contentVariant = flush ? 'flush' : dense ? 'dense' : 'default'

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
      <CardContent
        variant={contentVariant}
        className={cn(hasHeader && contentVariant === 'default' ? 'pt-0' : undefined, bodyClassName)}
      >
        {children}
      </CardContent>
    </Card>
  )
}
