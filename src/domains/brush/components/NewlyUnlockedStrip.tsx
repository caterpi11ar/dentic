import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import AchievementBadge from '@/components/achievements/AchievementBadge'
import { cn } from '@/components/ui/cn'
import { getAchievementById } from '@/services/achievements'

interface NewlyUnlockedStripProps {
  ids: string[]
  className?: string
}

const VISIBLE_LIMIT = 3

function navigateToAchievements(): void {
  Taro.navigateTo({ url: '/pages/achievements/index' }).catch(() => undefined)
}

export default function NewlyUnlockedStrip({ ids, className }: NewlyUnlockedStripProps) {
  if (ids.length === 0)
    return null

  const defs = ids
    .map(id => getAchievementById(id))
    .filter((def): def is NonNullable<typeof def> => Boolean(def))

  if (defs.length === 0)
    return null

  const visible = defs.slice(0, VISIBLE_LIMIT)
  const remaining = defs.length - visible.length
  const single = visible.length === 1
  const badgeSize = single ? 'lg' : 'md'

  return (
    <View
      className={cn(
        'w-full flex flex-col items-center px-2 animate-subtle-scale motion-reduce:animate-none',
        className,
      )}
    >
      <Text className="text-label-xs font-body text-content-tertiary tracking-wide">
        新解锁成就
      </Text>
      <View className={cn('mt-3 w-full flex items-start justify-center', single ? 'gap-0' : 'gap-5')}>
        {visible.map(def => (
          <AchievementBadge
            key={def.id}
            iconKey={def.icon}
            tier={def.tier}
            unlocked
            size={badgeSize}
            title={def.title}
          />
        ))}
      </View>
      {remaining > 0 && (
        <View
          className="mt-3 active:opacity-70"
          onClick={navigateToAchievements}
          role="button"
          aria-label={`还有 ${remaining} 个新成就，查看全部`}
        >
          <Text className="text-label-sm font-body text-primary">
            还有
            {' '}
            {remaining}
            {' '}
            个新成就 ›
          </Text>
        </View>
      )}
    </View>
  )
}
