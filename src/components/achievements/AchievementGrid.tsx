import type { AchievementDef, EvaluateContext } from '@/services/achievements'
import { Text, View } from '@tarojs/components'
import AchievementBadge from '@/components/achievements/AchievementBadge'
import { cn } from '@/components/ui/cn'

interface AchievementGridProps {
  achievements: AchievementDef[]
  unlockedIds: Set<string>
  context: EvaluateContext
  className?: string
}

export default function AchievementGrid({
  achievements,
  unlockedIds,
  context,
  className,
}: AchievementGridProps) {
  return (
    <View className={cn('grid grid-cols-4 gap-3', className)}>
      {achievements.map((achievement) => {
        const unlocked = unlockedIds.has(achievement.id)
        const progress = !unlocked && achievement.progress
          ? achievement.progress(context)
          : null

        return (
          <View key={achievement.id} className="flex flex-col items-center">
            <AchievementBadge
              iconKey={achievement.icon}
              tier={achievement.tier}
              unlocked={unlocked}
              size="md"
              title={achievement.title}
            />
            {!unlocked && (
              <Text className="mt-1 text-label-xs font-body text-content-tertiary tabular-nums">
                {progress
                  ? `${Math.min(progress.current, progress.target)} / ${progress.target}`
                  : ' '}
              </Text>
            )}
          </View>
        )
      })}
    </View>
  )
}
