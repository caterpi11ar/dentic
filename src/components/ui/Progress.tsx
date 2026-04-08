import { Text, View } from '@tarojs/components'
import { cn } from '@/components/ui/cn'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  label?: string
  trackClassName?: string
  indicatorClassName?: string
}

export default function Progress({
  value,
  max = 100,
  className,
  label,
  trackClassName,
  indicatorClassName,
}: ProgressProps) {
  const safeMax = max > 0 ? max : 100
  const pct = Math.min(100, Math.max(0, Math.round((value / safeMax) * 100)))

  return (
    <View
      className={cn('w-full', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={Math.min(safeMax, Math.max(0, value))}
      aria-label={label || '进度'}
    >
      {label ? <Text className="text-label-xs text-content/40">{label}</Text> : null}
      <View className={cn('mt-2 w-full h-1 rounded-full bg-content/[0.06] overflow-hidden', trackClassName)}>
        <View
          className={cn('h-full rounded-full bg-primary transition-[width] duration-300 ease-out', indicatorClassName)}
          style={{ width: `${pct}%` }}
        />
      </View>
    </View>
  )
}
