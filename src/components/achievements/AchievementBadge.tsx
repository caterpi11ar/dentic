import type { AchievementIconKey, AchievementTier } from '@/services/achievements'
import { Image, Text, View } from '@tarojs/components'
import iconCheerLocked from '@/assets/icons/achievements/achievement-cheer-locked.svg'
import iconCheerUnlocked from '@/assets/icons/achievements/achievement-cheer-unlocked.svg'
import iconCleanLocked from '@/assets/icons/achievements/achievement-clean-locked.svg'
import iconCleanUnlocked from '@/assets/icons/achievements/achievement-clean-unlocked.svg'
import iconDualLocked from '@/assets/icons/achievements/achievement-dual-locked.svg'
import iconDualUnlocked from '@/assets/icons/achievements/achievement-dual-unlocked.svg'
import iconFamilyLocked from '@/assets/icons/achievements/achievement-family-locked.svg'
import iconFamilyUnlocked from '@/assets/icons/achievements/achievement-family-unlocked.svg'
import iconStreakLocked from '@/assets/icons/achievements/achievement-streak-locked.svg'
import iconStreakUnlocked from '@/assets/icons/achievements/achievement-streak-unlocked.svg'
import iconTotalLocked from '@/assets/icons/achievements/achievement-total-locked.svg'
import iconTotalUnlocked from '@/assets/icons/achievements/achievement-total-unlocked.svg'
import { cn } from '@/components/ui/cn'

export type AchievementBadgeSize = 'sm' | 'md' | 'lg'

interface AchievementBadgeProps {
  iconKey: AchievementIconKey
  tier: AchievementTier
  unlocked: boolean
  size?: AchievementBadgeSize
  title?: string
  className?: string
}

const ICON_MAP: Record<AchievementIconKey, { locked: string, unlocked: string }> = {
  streak: { locked: iconStreakLocked, unlocked: iconStreakUnlocked },
  dual: { locked: iconDualLocked, unlocked: iconDualUnlocked },
  clean: { locked: iconCleanLocked, unlocked: iconCleanUnlocked },
  total: { locked: iconTotalLocked, unlocked: iconTotalUnlocked },
  family: { locked: iconFamilyLocked, unlocked: iconFamilyUnlocked },
  cheer: { locked: iconCheerLocked, unlocked: iconCheerUnlocked },
}

const sizeStyles: Record<AchievementBadgeSize, { ring: string, icon: string, label: string }> = {
  sm: { ring: 'size-14', icon: 'size-6', label: 'mt-1.5 text-label-xs' },
  md: { ring: 'size-[72px]', icon: 'size-7', label: 'mt-2 text-label-sm' },
  lg: { ring: 'size-24', icon: 'size-10', label: 'mt-2 text-label-md' },
}

function tierFrame(tier: AchievementTier, unlocked: boolean): string {
  if (!unlocked)
    return 'bg-surface border border-line'

  if (tier === 'gold')
    return 'bg-primary-light border-2 border-primary/30'

  if (tier === 'silver')
    return 'bg-surface-white border-2 border-content-secondary'

  return 'bg-surface-white border border-content-tertiary'
}

export default function AchievementBadge({
  iconKey,
  tier,
  unlocked,
  size = 'md',
  title,
  className,
}: AchievementBadgeProps) {
  const sources = ICON_MAP[iconKey]
  const src = unlocked ? sources.unlocked : sources.locked
  const { ring, icon, label } = sizeStyles[size]

  return (
    <View className={cn('flex flex-col items-center', className)}>
      <View
        className={cn(
          'rounded-full flex items-center justify-center',
          ring,
          tierFrame(tier, unlocked),
        )}
        role="img"
        aria-label={`${title ?? '成就'}（${unlocked ? '已解锁' : '未解锁'}）`}
      >
        <Image className={icon} src={src} mode="aspectFit" />
      </View>
      {title && (
        <Text
          className={cn(
            'font-body text-center leading-tight',
            label,
            unlocked ? 'text-content' : 'text-content-tertiary',
          )}
        >
          {title}
        </Text>
      )}
    </View>
  )
}
