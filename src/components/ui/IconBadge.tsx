import type { ReactNode } from 'react'
import { View } from '@tarojs/components'
import { cn } from '@/components/ui/cn'

export type IconBadgeVariant = 'neutral' | 'accent'
export type IconBadgeSize = 'sm' | 'md'

interface IconBadgeProps {
  icon: ReactNode
  variant?: IconBadgeVariant
  size?: IconBadgeSize
  className?: string
}

const SIZE_CLASS: Record<IconBadgeSize, string> = {
  sm: 'size-8',
  md: 'size-9',
}

const VARIANT_CLASS: Record<IconBadgeVariant, string> = {
  neutral: 'border border-line bg-surface text-content-secondary',
  accent: 'border border-primary/20 bg-primary-light text-primary',
}

export default function IconBadge({
  icon,
  variant = 'neutral',
  size = 'md',
  className,
}: IconBadgeProps) {
  return (
    <View
      className={cn(
        'rounded-anthropic-sm flex items-center justify-center shrink-0',
        SIZE_CLASS[size],
        VARIANT_CLASS[variant],
        className,
      )}
    >
      {icon}
    </View>
  )
}
