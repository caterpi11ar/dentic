import { View, Text } from '@tarojs/components'
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { cn } from '@/components/ui/cn'

export interface BottomNavItem<T extends string = string> {
  key: T
  label: string
  icon: ReactNode
}

interface BottomNavProps<T extends string = string> {
  items: Array<BottomNavItem<T>>
  activeKey: T
  onChange: (key: T) => void
  className?: string
}

export default function BottomNav<T extends string>({ items, activeKey, onChange, className }: BottomNavProps<T>) {
  const handleKeyDown = (event: ReactKeyboardEvent, key: T) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onChange(key)
  }

  return (
    <View
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 pb-8 pt-3.5 bg-surface-white/95 shadow-nav backdrop-blur-sm',
        className
      )}
      role="tablist"
      aria-label="页面导航"
    >
      {items.map((item) => {
        const active = item.key === activeKey

        return (
          <View
            key={item.key}
            className={cn(
              'min-w-20 px-4 py-2.5 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors duration-150',
              active ? 'text-primary' : 'text-content-disabled active:opacity-80'
            )}
            onClick={() => onChange(item.key)}
            onKeyDown={(event) => handleKeyDown(event, item.key)}
            role="tab"
            aria-selected={active}
            aria-current={active ? 'page' : undefined}
            aria-label={item.label}
            tabIndex={0}
          >
            <View className="leading-none flex items-center justify-center">{item.icon}</View>
            <Text className={cn('text-label-xs font-body font-semibold tracking-[0.06em]', active ? 'text-primary' : 'text-content-disabled')}>
              {item.label}
            </Text>
          </View>
        )
      })}
    </View>
  )
}
