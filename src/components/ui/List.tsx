import type { PropsWithChildren, ReactNode } from 'react'
import { Text, View } from '@tarojs/components'
import { cn } from '@/components/ui/cn'

interface ListProps extends PropsWithChildren {
  className?: string
}

export function List({ className, children }: ListProps) {
  return (
    <View
      className={cn(
        'overflow-hidden rounded-anthropic-lg border border-line bg-surface-white',
        className,
      )}
    >
      <View className="divide-y divide-line">
        {children}
      </View>
    </View>
  )
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
        'px-4 py-3.5 min-h-[3.75rem] flex items-center justify-between gap-3 bg-surface-white transition-colors duration-200 ease-out',
        interactive && !disabled && 'active:bg-primary-light/45',
        disabled && 'opacity-55',
        className,
      )}
      onClick={interactive && !disabled ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      aria-label={interactive ? (ariaLabel ?? title) : undefined}
      aria-disabled={interactive ? disabled : undefined}
    >
      <View className="min-w-0 flex-1 flex items-center gap-2.5">
        {left ? <View className="shrink-0">{left}</View> : null}
        <View className="min-w-0 flex-1">
          <Text className="text-paragraph-sm font-body font-semibold text-content block truncate">{title}</Text>
          {description ? <Text className="mt-1 text-label-sm text-content/50 block">{description}</Text> : null}
        </View>
      </View>
      {right ? <View className="shrink-0">{right}</View> : null}
    </View>
  )
}
