import type { TabOption } from '@/components/ui/Tabs'
import type { RankItem } from '@/services/api/rankApi'
import type { RankPeriodType } from '@/types'
import { Image, Text, View } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import iconEmpty from '@/assets/icons/icon-empty.svg'
import iconMedal1 from '@/assets/icons/icon-medal-1.svg'
import iconMedal2 from '@/assets/icons/icon-medal-2.svg'
import iconMedal3 from '@/assets/icons/icon-medal-3.svg'
import AvatarImage from '@/components/AvatarImage'
import InPageTabBar from '@/components/InPageTabBar'
import PageLayout from '@/components/PageLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/components/ui/cn'
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

function getRankIcon(rank: number): string | null {
  if (rank === 1)
    return iconMedal1
  if (rank === 2)
    return iconMedal2
  if (rank === 3)
    return iconMedal3
  return null
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
      <Text className="text-display-md font-body font-medium tracking-tight text-content">
        排行榜
      </Text>

      {/* 榜单类型切换 */}
      <View className="mt-6 flex justify-center">
        <Tabs
          value={periodType}
          options={RANK_TAB_OPTIONS}
          onValueChange={handlePeriodChange}
          className="w-full"
        />
      </View>

      {/* 我的排名卡 */}
      {myRank && (
        <Card className="mt-6">
          <CardContent className="py-3.5">
            <View className="flex items-center justify-between">
              <View>
                <Text className="text-label-xs font-heading font-semibold tracking-[0.08em] uppercase text-content-tertiary">
                  我的排名
                </Text>
                <Text className="mt-1 block text-display-sm font-heading font-bold text-primary">
                  #
                  {myRank.rank}
                </Text>
              </View>
              <View className="text-right">
                <Text className="text-label-xs font-heading font-semibold tracking-[0.08em] uppercase text-content-tertiary">
                  {PERIOD_LABELS[periodType]}
                </Text>
                <Text className="mt-1 block text-paragraph-md font-heading font-bold tabular-nums text-content-secondary">
                  {myRank.score}
                  {unit}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>
      )}

      {/* 排行列表 */}
      <View className="mt-6 flex-1 min-h-0 overflow-y-auto">
        {loading ? (
          <View className="flex flex-col gap-3 p-4">
            {[1, 2, 3].map(i => (
              <View key={i} className="h-14 rounded-anthropic bg-line animate-shimmer" />
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
          <Card>
            <CardContent className="p-0">
              {list.map((item) => {
                const medal = getRankIcon(item.rank)
                return (
                  <View
                    key={item.openId}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 border-b border-line last:border-b-0 transition-colors duration-200 ease-out',
                      item.isMe ? 'bg-primary-light/55' : 'bg-surface-white',
                    )}
                  >
                    {/* 排名 */}
                    <View className="w-8 flex items-center justify-center flex-shrink-0">
                      {medal ? (
                        <Image src={medal} className="size-6" mode="aspectFit" />
                      ) : (
                        <Text className="font-body font-medium text-content-tertiary">
                          {item.rank}
                        </Text>
                      )}
                    </View>

                    {/* 头像 */}
                    <View className="size-9 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.avatar ? (
                        <AvatarImage src={item.avatar} className="size-9 rounded-full" mode="aspectFill" />
                      ) : (
                        <Text className="text-paragraph-sm font-heading font-semibold text-primary">
                          {item.nickname.slice(0, 1) || '?'}
                        </Text>
                      )}
                    </View>

                    {/* 昵称 */}
                    <View className="flex-1 min-w-0">
                      <Text
                        className={cn(
                          'text-paragraph-sm font-body truncate',
                          item.isMe ? 'text-primary font-medium' : 'text-content',
                        )}
                      >
                        {item.nickname}
                        {item.isMe && ' (我)'}
                      </Text>
                    </View>

                    {/* 分数 */}
                    <Text className="text-paragraph-sm font-heading font-bold tabular-nums text-content-secondary flex-shrink-0">
                      {item.score}
                      {unit}
                    </Text>
                  </View>
                )
              })}
            </CardContent>
          </Card>
        )}
      </View>

      <InPageTabBar current="rank" />
    </PageLayout>
  )
}
