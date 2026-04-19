import { View } from '@tarojs/components'
import { cn } from '@/components/ui/cn'

const BASE = 'bg-content/[0.06] animate-fade-in motion-reduce:animate-none'

interface SkeletonLineProps {
  width?: string
  height?: string
  className?: string
}

export function SkeletonLine({
  width = 'w-full',
  height = 'h-3',
  className,
}: SkeletonLineProps) {
  return <View className={cn(BASE, 'rounded-anthropic-sm', width, height, className)} />
}

interface SkeletonCircleProps {
  size?: string
  className?: string
}

export function SkeletonCircle({ size = 'size-9', className }: SkeletonCircleProps) {
  return <View className={cn(BASE, 'rounded-full', size, className)} />
}

interface SkeletonRowProps {
  className?: string
}

export function SkeletonRow({ className }: SkeletonRowProps) {
  return (
    <View className={cn('flex items-center gap-3 px-5 py-4', className)}>
      <SkeletonCircle />
      <View className="flex-1 flex flex-col gap-2">
        <SkeletonLine width="w-2/3" height="h-3" />
        <SkeletonLine width="w-1/3" height="h-2.5" />
      </View>
    </View>
  )
}
