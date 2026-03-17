import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import { getWeeklyStats, type WeeklyStatsData } from '../../services/storage'

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

export default function WeeklyStats() {
  const [stats, setStats] = useState<WeeklyStatsData | null>(null)

  useDidShow(() => {
    setStats(getWeeklyStats())
  })

  if (!stats) {
    return (
      <View className="bg-surface-white rounded-2xl p-4 mb-3 shadow-card-lg">
        <Text className="text-xs text-content-secondary font-medium tracking-wide">本周概览</Text>
        <View className="flex items-end gap-2 mt-3 h-24">
          {WEEKDAY_LABELS.map((label) => (
            <View key={label} className="flex-1 flex flex-col items-center gap-1.5">
              <View className="w-full flex items-end justify-center h-16">
                <View className="w-full rounded-lg bg-line" style={{ height: '20%' }} />
              </View>
              <Text className="text-xs text-content-disabled">{label}</Text>
            </View>
          ))}
        </View>
      </View>
    )
  }

  const maxCount = Math.max(...stats.days.map((d) => d.count), 1)

  return (
    <View className="bg-surface-white rounded-2xl p-4 mb-3 shadow-card-lg">
      <View className="flex justify-between items-center mb-3">
        <Text className="text-xs text-content-secondary font-medium tracking-wide">本周概览</Text>
        <View className="flex items-center gap-4">
          <View className="flex items-center gap-1">
            <Text className="text-sm font-bold text-primary tabular-nums">{stats.totalSessions}</Text>
            <Text className="text-xs text-content-secondary">次</Text>
          </View>
          <View className="flex items-center gap-1">
            <Text className="text-sm font-bold text-primary tabular-nums">
              {stats.avgDuration > 0
                ? `${Math.floor(stats.avgDuration / 60)}:${String(stats.avgDuration % 60).padStart(2, '0')}`
                : '--'}
            </Text>
            <Text className="text-xs text-content-secondary">均时</Text>
          </View>
        </View>
      </View>

      <View className="flex items-end gap-2 h-24" role="img" aria-label={`本周刷牙统计：共${stats.totalSessions}次`}>
        {stats.days.map((day, i) => {
          const pct = day.count > 0 ? (day.count / maxCount) * 100 : 6
          return (
            <View key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
              <View className="w-full flex flex-col items-center justify-end h-16">
                {day.count > 0 && (
                  <Text className="text-xs text-primary font-bold mb-1 tabular-nums">{day.count}</Text>
                )}
                <View
                  className={`w-full rounded-lg transition-[height] duration-300 ease-in-out motion-reduce:transition-none ${
                    day.count > 0 ? 'bg-primary' : 'bg-line-light'
                  }`}
                  style={{ height: `${pct}%` }}
                />
              </View>
              <Text className={`text-xs ${day.count > 0 ? 'text-content font-medium' : 'text-content-disabled'}`}>
                {WEEKDAY_LABELS[i]}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}
