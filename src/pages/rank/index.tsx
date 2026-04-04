import { useEffect, useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import InPageTabBar from '@/components/InPageTabBar'
import Tabs from '@/components/ui/Tabs'
import type { TabOption } from '@/components/ui/Tabs'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/components/ui/cn'
import { getLeaderboard } from '@/services/api/rankApi'
import type { RankItem } from '@/services/api/rankApi'
import { applyLightThemeToChrome } from '@/services/theme'
import { trackEvent } from '@/services/analytics'
import { getPageTopPadding } from '@/utils/layout'
import type { RankPeriodType } from '@/types'

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

function getRankIcon(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return String(rank)
}

export default function RankPage() {
  const safeTopPadding = getPageTopPadding(20)
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
    } catch (e) {
      setError('加载失败: ' + String(e && (e as Error).message ? (e as Error).message : e))
    } finally {
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
    <View className="theme-page theme-day h-screen overflow-hidden">
      <View
        className="px-page-x max-w-2xl mx-auto h-full pb-bottom-safe flex flex-col"
        style={{ paddingTop: safeTopPadding }}
      >
        <Text className="text-display-sm font-body font-medium tracking-tight text-content">
          排行榜
        </Text>

        {/* 榜单类型切换 */}
        <View className="mt-4 flex justify-center">
          <Tabs
            value={periodType}
            options={RANK_TAB_OPTIONS}
            onValueChange={handlePeriodChange}
            className="w-full"
          />
        </View>

        {/* 我的排名卡 */}
        {myRank && (
          <Card className="mt-4 border-primary/20 bg-primary-light/30">
            <CardContent className="py-3.5">
              <View className="flex items-center justify-between">
                <View>
                  <Text className="text-label-xs font-heading font-semibold tracking-[0.08em] uppercase text-content/45">
                    我的排名
                  </Text>
                  <Text className="mt-1 block text-display-sm font-heading font-bold text-primary">
                    #{myRank.rank}
                  </Text>
                </View>
                <View className="text-right">
                  <Text className="text-label-xs font-heading font-semibold tracking-[0.08em] uppercase text-content/45">
                    {PERIOD_LABELS[periodType]}
                  </Text>
                  <Text className="mt-1 block text-paragraph-md font-heading font-bold tabular-nums text-content">
                    {myRank.score}{unit}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        )}

        {/* 排行列表 */}
        <View className="mt-4 flex-1 min-h-0 overflow-y-auto">
          {loading ? (
            <Card>
              <CardContent>
                <Text className="text-paragraph-sm text-content/45 text-center">加载中...</Text>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent>
                <Text className="text-paragraph-sm text-danger text-center">{error}</Text>
              </CardContent>
            </Card>
          ) : list.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-8 gap-2">
                <Text className="text-display-sm">🏆</Text>
                <Text className="text-paragraph-sm text-content/45 text-center">
                  暂无排行数据，完成刷牙后即可上榜
                </Text>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                {list.map((item) => (
                  <View
                    key={item.openId}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 border-b border-content/[0.06] last:border-b-0',
                      item.isMe && 'bg-primary-light/40',
                    )}
                  >
                    {/* 排名 */}
                    <View className="w-8 flex items-center justify-center flex-shrink-0">
                      <Text
                        className={cn(
                          'font-heading font-bold',
                          item.rank <= 3 ? 'text-paragraph-md' : 'text-paragraph-sm text-content/50',
                        )}
                      >
                        {getRankIcon(item.rank)}
                      </Text>
                    </View>

                    {/* 头像 */}
                    <View className="size-9 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.avatar ? (
                        <Image src={item.avatar} className="size-9 rounded-full" mode="aspectFill" />
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
                    <Text className="text-paragraph-sm font-heading font-bold tabular-nums text-content flex-shrink-0">
                      {item.score}{unit}
                    </Text>
                  </View>
                ))}
              </CardContent>
            </Card>
          )}
        </View>
      </View>

      <InPageTabBar current="rank" />
    </View>
  )
}
