import { Text, View } from '@tarojs/components'
import { cn } from '@/components/ui/cn'
import Progress from '@/components/ui/Progress'

interface AchievementProgressProps {
  unlockedCount: number
  totalCount: number
  className?: string
}

export default function AchievementProgress({
  unlockedCount,
  totalCount,
  className,
}: AchievementProgressProps) {
  const safeTotal = totalCount > 0 ? totalCount : 1

  return (
    <View
      className={cn(
        'rounded-anthropic-lg border border-line bg-surface-white px-5 py-5',
        className,
      )}
      aria-label={`已解锁 ${unlockedCount} 枚，共 ${totalCount} 枚`}
    >
      <View className="flex items-baseline justify-between gap-3">
        <Text className="text-label-xs font-body uppercase tracking-wide text-content-tertiary">
          总进度
        </Text>
        <View className="flex items-baseline gap-1">
          <Text className="text-display-sm font-heading font-medium text-primary tabular-nums">
            {unlockedCount}
          </Text>
          <Text className="text-paragraph-sm font-body text-content-tertiary">
            /
            {' '}
            {totalCount}
          </Text>
        </View>
      </View>
      <Progress
        className="mt-3"
        value={unlockedCount}
        max={safeTotal}
      />
    </View>
  )
}
