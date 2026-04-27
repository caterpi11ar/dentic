import type { AchievementCategory, AchievementDef, EvaluateContext } from '@/services/achievements'
import { Text, View } from '@tarojs/components'
import AchievementGrid from '@/components/achievements/AchievementGrid'
import { cn } from '@/components/ui/cn'
import { ACHIEVEMENT_CATEGORY_LABELS } from '@/services/achievements'

interface AchievementCategorySectionProps {
  category: AchievementCategory
  achievements: AchievementDef[]
  unlockedIds: Set<string>
  context: EvaluateContext
  className?: string
}

export default function AchievementCategorySection({
  category,
  achievements,
  unlockedIds,
  context,
  className,
}: AchievementCategorySectionProps) {
  const unlockedCount = achievements.filter(a => unlockedIds.has(a.id)).length
  const total = achievements.length

  return (
    <View className={cn('space-y-3', className)}>
      <View className="flex items-center justify-between">
        <Text className="text-paragraph-sm font-body font-semibold text-content">
          {ACHIEVEMENT_CATEGORY_LABELS[category]}
        </Text>
        <Text className="text-label-xs font-body text-content-tertiary tabular-nums">
          {unlockedCount}
          {' '}
          /
          {' '}
          {total}
        </Text>
      </View>
      <AchievementGrid
        achievements={achievements}
        unlockedIds={unlockedIds}
        context={context}
      />
    </View>
  )
}
