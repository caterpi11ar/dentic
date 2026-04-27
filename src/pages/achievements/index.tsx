import type { AchievementCategory, EvaluateContext } from '@/services/achievements'
import { View } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import AchievementCategorySection from '@/components/achievements/AchievementCategorySection'
import AchievementProgress from '@/components/achievements/AchievementProgress'
import PageLayout from '@/components/PageLayout'
import PageHeader from '@/components/ui/PageHeader'
import {
  ACHIEVEMENTS,
  evaluateAndMerge,
  getAchievementsByCategory,
} from '@/services/achievements'
import { applyLightThemeToChrome } from '@/services/theme'
import { useAchievementsStore } from '@/stores/achievements'
import { useFamilyStore } from '@/stores/family'
import { useRecordsStore } from '@/stores/records'

const CATEGORY_ORDER: AchievementCategory[] = ['streak', 'dual', 'clean', 'total', 'family']

export default function AchievementsPage() {
  const records = useRecordsStore(s => s.records)
  const dashboard = useFamilyStore(s => s.dashboard)
  const cheersSent = useAchievementsStore(s => s.cheersSent)
  const unlocked = useAchievementsStore(s => s.unlocked)

  const [now, setNow] = useState(() => new Date())

  useDidShow(() => {
    applyLightThemeToChrome()
    // 进入总览页时再评估一次，确保展示与最新数据一致
    evaluateAndMerge()
    // 刷新 now，避免长时间停留跨过 04:00 业务日边界后进度仍是旧值
    setNow(new Date())
  })

  const unlockedIds = useMemo(
    () => new Set(unlocked.map(entry => entry.id)),
    [unlocked],
  )

  const context: EvaluateContext = useMemo(
    () => ({
      records,
      dashboard,
      localCounters: { cheersSent },
      now,
    }),
    [records, dashboard, cheersSent, now],
  )

  return (
    <PageLayout scroll>
      <PageHeader title="我的成就" description="刷牙路上的每个里程碑" />

      <AchievementProgress
        unlockedCount={unlockedIds.size}
        totalCount={ACHIEVEMENTS.length}
      />

      <View className="mt-section-gap space-y-section-gap">
        {CATEGORY_ORDER.map(category => (
          <AchievementCategorySection
            key={category}
            category={category}
            achievements={getAchievementsByCategory(category)}
            unlockedIds={unlockedIds}
            context={context}
          />
        ))}
      </View>
    </PageLayout>
  )
}
