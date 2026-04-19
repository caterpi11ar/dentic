import type { ReactNode } from 'react'
import { Text, View } from '@tarojs/components'
import { cn } from '@/components/ui/cn'
import { useMotionPreset } from '@/motion'

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
  const navMotion = useMotionPreset('navPress')
  const transitionStyle = {
    transitionDuration: `${navMotion.duration}ms`,
    transitionTimingFunction: navMotion.easing,
  }

  return (
    <View
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 flex items-center px-0 pt-2 bg-surface-white/95 shadow-nav backdrop-blur-sm',
        className,
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="tablist"
      aria-label="页面导航"
    >
      {items.map((item) => {
        const active = item.key === activeKey

        return (
          <View
            key={item.key}
            className={cn(
              'relative min-w-0 flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 transition-[color,transform,opacity]',
              active ? 'text-primary -translate-y-[1px]' : 'text-content-disabled active:opacity-80',
            )}
            style={transitionStyle}
            onClick={() => onChange(item.key)}
            role="tab"
            aria-selected={active}
            aria-current={active ? 'page' : undefined}
            aria-label={item.label}
          >
            <View
              className={cn(
                'leading-none flex items-center justify-center transition-transform',
                active ? 'scale-105' : 'scale-100',
              )}
              style={transitionStyle}
            >
              {item.icon}
            </View>
            <Text
              className={cn(
                'text-label-xs font-body font-semibold transition-[color,opacity,transform]',
                active ? 'text-primary opacity-100' : 'text-content-disabled opacity-80',
              )}
              style={transitionStyle}
            >
              {item.label}
            </Text>
          </View>
        )
      })}
    </View>
  )
}
