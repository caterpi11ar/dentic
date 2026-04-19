import type { TabOption } from '@/components/ui/Tabs'
import type { RankItem } from '@/services/api/rankApi'
import type { RankPeriodType } from '@/types'
import { Image, Text, View } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import iconEmpty from '@/assets/icons/icon-empty.svg'
import AvatarImage from '@/components/AvatarImage'
import InPageTabBar from '@/components/InPageTabBar'
import PageLayout from '@/components/PageLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/components/ui/cn'
import { SkeletonRow } from '@/components/ui/LoadingSkeleton'
import PageHeader from '@/components/ui/PageHeader'
import Section from '@/components/ui/Section'
import StatRow from '@/components/ui/StatRow'
import Tabs from '@/components/ui/Tabs'
import { trackEvent } from '@/services/analytics'
import { getLeaderboard } from '@/services/api/rankApi'
import { applyLightThemeToChrome } from '@/services/theme'

const RANK_TAB_OPTIONS: TabOption<RankPeriodType>[] = [
  { value: 'totalDays', label: '累计天数' },
  { value: 'streak', label: '连续天数' },
]

const PERIOD_UNITS: Record<RankPeriodType, string> = {
  totalDays: '天',
  streak: '天',
}

const PERIOD_LABELS: Record<RankPeriodType, string> = {
  totalDays: '累计刷牙',
  streak: '连续打卡',
}

function getRankClass(rank: number): string {
  if (rank === 1)
    return 'text-display-sm font-heading font-medium text-primary'
  if (rank === 2)
    return 'text-display-sm font-heading font-medium text-content'
  if (rank === 3)
    return 'text-display-sm font-heading font-medium text-content-secondary'
  return 'text-paragraph-sm font-body font-medium text-content-tertiary'
}

export default function RankPage() {
  const [periodType, setPeriodType] = useState<RankPeriodType>('totalDays')
  const [list, setList] = useState<RankItem[]>([])
  const [myRank, setMyRank] = useState<RankItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async (type: RankPeriodType) => {
    setLoading(true)
    setError(null)
    try {
      const result = await getLeaderboard(type)
      setList(result.list)
      setMyRank(result.myRank)
    }
    catch (e) {
      setError(`加载失败: ${String(e && (e as Error).message ? (e as Error).message : e)}`)
    }
    finally {
      setLoading(false)
    }
  }

  useDidShow(() => {
    applyLightThemeToChrome()
    trackEvent('rank_view')
    fetchData(periodType)
  })

  useEffect(() => {
    fetchData(periodType)
  }, [periodType])

  const handlePeriodChange = (value: RankPeriodType) => {
    setPeriodType(value)
    trackEvent('rank_tab_switch', { periodType: value })
  }

  const unit = PERIOD_UNITS[periodType]

  return (
    <PageLayout>
      <PageHeader title="排行榜" />

      {/* 榜单类型切换 */}
      <View className="flex justify-center">
        <Tabs
          value={periodType}
          options={RANK_TAB_OPTIONS}
          onValueChange={handlePeriodChange}
          className="w-full"
        />
      </View>

      {/* 我的排名卡 */}
      {myRank && (
        <Section variant="group" label="我的排名" className="mt-page-gap">
          <View className="flex items-end justify-between">
            <StatRow label="排名" value={`#${myRank.rank}`} tone="primary" />
            <StatRow label={PERIOD_LABELS[periodType]} value={myRank.score} unit={unit} />
          </View>
        </Section>
      )}

      {/* 排行列表 */}
      <View className="mt-page-gap flex-1 min-h-0 overflow-y-auto">
        {loading ? (
          <View className="divide-y divide-line border-y border-line">
            {[1, 2, 3, 4, 5].map(i => (
              <SkeletonRow key={i} />
            ))}
          </View>
        ) : error ? (
          <Card>
            <CardContent>
              <Text className="text-paragraph-sm text-danger text-center">{error}</Text>
            </CardContent>
          </Card>
        ) : list.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-8 gap-2">
              <Image src={iconEmpty} className="size-16" mode="aspectFit" />
              <Text className="text-paragraph-sm text-content-tertiary text-center">
                暂无排行数据，完成刷牙后即可上榜
              </Text>
            </CardContent>
          </Card>
        ) : (
          <View className="divide-y divide-line border-y border-line">
            {list.map((item) => {
              return (
                <View
                  key={item.openId}
                  className={cn(
                    'flex items-center gap-3 px-5 py-4 min-h-14 bg-surface-white transition-colors duration-200 ease-out',
                    item.isMe && 'relative pl-[18px] before:absolute before:left-0 before:top-3 before:bottom-3 before:w-[2px] before:bg-primary',
                  )}
                >
                  {/* 排名 */}
                  <View className="w-8 flex items-baseline justify-center flex-shrink-0">
                    <Text className={cn('tabular-nums leading-none', getRankClass(item.rank))}>
                      {item.rank}
                    </Text>
                  </View>

                  {/* 头像 */}
                  <View className="size-9 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.avatar ? (
                      <AvatarImage src={item.avatar} className="size-9 rounded-full" mode="aspectFill" />
                    ) : (
                      <Text className="text-paragraph-sm font-body font-semibold text-primary">
                        {item.nickname.slice(0, 1) || '?'}
                      </Text>
                    )}
                  </View>

                  {/* 昵称 */}
                  <View className="flex-1 min-w-0">
                    <Text
                      className={cn(
                        'text-paragraph-sm font-body truncate block',
                        item.isMe ? 'text-primary font-semibold' : 'text-content',
                      )}
                    >
                      {item.nickname}
                      {item.isMe && ' (我)'}
                    </Text>
                  </View>

                  {/* 分数 */}
                  <Text className="text-paragraph-sm font-body font-semibold tabular-nums text-content-secondary flex-shrink-0">
                    {item.score}
                    {unit}
                  </Text>
                </View>
              )
            })}
          </View>
        )}
      </View>

      <InPageTabBar current="rank" />
    </PageLayout>
  )
}
