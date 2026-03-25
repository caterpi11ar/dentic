import { View, Text } from '@tarojs/components'
import type { PropsWithChildren, ReactNode } from 'react'
import { cn } from '@/components/ui/cn'

interface ListProps extends PropsWithChildren {
  className?: string
}

export function List({ className, children }: ListProps) {
  return <View className={cn('rounded-xl border border-line-light overflow-hidden divide-y divide-line-light', className)}>{children}</View>
}

interface ListItemProps {
  title: string
  description?: string
  left?: ReactNode
  right?: ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  ariaLabel?: string
}

export function ListItem({
  title,
  description,
  left,
  right,
  className,
  onClick,
  disabled = false,
  ariaLabel,
}: ListItemProps) {
  const interactive = !!onClick

  return (
    <View
      className={cn(
        'px-3.5 py-3 min-h-14 flex items-center justify-between gap-3 bg-surface-white',
        interactive && !disabled && 'active:opacity-85',
        disabled && 'opacity-55',
        className
      )}
      onClick={interactive && !disabled ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      aria-label={interactive ? (ariaLabel ?? title) : undefined}
      aria-disabled={interactive ? disabled : undefined}
    >
      <View className="min-w-0 flex-1 flex items-center gap-2.5">
        {left ? <View className="shrink-0">{left}</View> : null}
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-heading font-semibold text-content block truncate">{title}</Text>
          {description ? <Text className="mt-0.5 text-sm text-content-tertiary block">{description}</Text> : null}
        </View>
      </View>
      {right ? <View className="shrink-0">{right}</View> : null}
    </View>
  )
}
