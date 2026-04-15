import type { CSSProperties, PropsWithChildren } from 'react'
import { Text, View } from '@tarojs/components'
import { cn } from '@/components/ui/cn'

interface CardProps extends PropsWithChildren {
  className?: string
  style?: CSSProperties
  interactive?: boolean
}

interface CardSectionProps extends PropsWithChildren {
  className?: string
}

interface CardTextProps extends PropsWithChildren {
  className?: string
}

export function Card({
  className,
  children,
  interactive = false,
  style,
}: CardProps) {
  return (
    <View
      className={cn(
        'relative overflow-hidden rounded-anthropic-lg border border-line bg-surface-white text-content transition-[transform,border-color] duration-200 ease-out',
        interactive && 'active:scale-[0.995] active:translate-y-px',
        className,
      )}
      style={style}
    >
      <View className="pointer-events-none absolute inset-x-0 top-0 h-px bg-surface-white/80" />
      <View className="relative">
        {children}
      </View>
    </View>
  )
}

export function CardHeader({ className, children }: CardSectionProps) {
  return <View className={cn('px-5 pt-5 pb-2', className)}>{children}</View>
}

export function CardContent({ className, children }: CardSectionProps) {
  return <View className={cn('px-5 py-4', className)}>{children}</View>
}

export function CardFooter({ className, children }: CardSectionProps) {
  return <View className={cn('px-5 pb-5 pt-3', className)}>{children}</View>
}

export function CardTitle({ className, children }: CardTextProps) {
  return (
    <Text className={cn('text-paragraph-md font-heading font-medium tracking-tight text-content', className)}>
      {children}
    </Text>
  )
}

export function CardDescription({ className, children }: CardTextProps) {
  return (
    <Text className={cn('block mt-1.5 text-paragraph-sm text-content-secondary', className)}>
      {children}
    </Text>
  )
}
