import { useMemo, useRef, useState } from 'react'
import { View, Text } from '@tarojs/components'
import { useShareAppMessage } from '@tarojs/taro'
import InPageTabBar from '../../components/InPageTabBar'
import { useTimeTheme } from '../../hooks/useTimeTheme'
import { getThemeClassName } from '../../services/theme'
import { getPageTopPadding } from '../../utils/layout'
import {
  formatDate,
  getCurrentStreak,
  getRecordsByDate,
  getRecordsByMonth,
  getTotalBrushedDays,
} from '../../services/storage'
import { generateShareMessage } from '../../services/share'
import type { BrushingRecord } from '../../types'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const SESSION_LABELS = { morning: '晨间', evening: '夜间' } as const
const SESSION_ICONS = { morning: '☀️', evening: '🌙' } as const

function formatCompletedTime(timestamp?: number): string {
  if (typeof timestamp !== 'number') return '--:--'
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '--:--'
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export default function HistoryPage() {
  const { themeMode } = useTimeTheme()
  const safeTopPadding = getPageTopPadding(20)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedRecords, setSelectedRecords] = useState<BrushingRecord[]>([])
  const todayRef = useRef(new Date())
  const today = todayRef.current
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  useShareAppMessage(() => generateShareMessage())

  const monthRecords = useMemo(() => getRecordsByMonth(year, month), [year, month])
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()
  const todayStr = formatDate(today)

  const daySessionMap = useMemo(() => {
    const map = new Map<string, { morning: boolean; evening: boolean }>()
    monthRecords
      .filter((r) => r.completed)
      .forEach((r) => {
        const entry = map.get(r.date) ?? { morning: false, evening: false }
        if (r.session === 'morning') entry.morning = true
        if (r.session === 'evening') entry.evening = true
        map.set(r.date, entry)
      })
    return map
  }, [monthRecords])

  const monthBrushedDays = daySessionMap.size
  const monthGoalProgress = daysInMonth > 0 ? Math.round((monthBrushedDays / daysInMonth) * 100) : 0
  const currentStreak = getCurrentStreak()
  const totalBrushedDays = getTotalBrushedDays()

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear((prev) => prev - 1)
      setMonth(12)
      return
    }
    setMonth((prev) => prev - 1)
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setYear((prev) => prev + 1)
      setMonth(1)
      return
    }
    setMonth((prev) => prev + 1)
  }

  const handleSelectDay = (day: number) => {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(date)
    setSelectedRecords(getRecordsByDate(date))
  }

  return (
    <View className={`theme-page ${getThemeClassName(themeMode)} min-h-screen`}>
      <View
        className="h-screen overflow-hidden pb-24 px-5 max-w-2xl mx-auto flex flex-col gap-2"
        style={{ paddingTop: safeTopPadding }}
      >
        <View className="bg-surface-white rounded-xl p-3 border border-line-light">
          <View className="flex justify-between items-center mb-2">
            <Text className="text-base font-bold tracking-tight text-content">
              {year} 年 {month} 月
            </Text>
            <View className="flex gap-1">
              <View
                className="w-9 h-9 rounded-full bg-surface border border-line-light flex items-center justify-center active:opacity-85"
                onClick={handlePrevMonth}
              >
                <View
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    borderRight: '8px solid rgb(var(--twc-content-secondary))',
                    marginLeft: '2px',
                  }}
                />
              </View>
              <View
                className="w-9 h-9 rounded-full bg-surface border border-line-light flex items-center justify-center active:opacity-85"
                onClick={handleNextMonth}
              >
                <View
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    borderLeft: '8px solid rgb(var(--twc-content-secondary))',
                    marginRight: '2px',
                  }}
                />
              </View>
            </View>
          </View>

          <View className="flex items-center justify-between mb-1.5">
            <Text className="text-xs font-medium text-content-tertiary">本月{monthBrushedDays}/{daysInMonth}天</Text>
            <Text className="text-xs font-medium text-content-tertiary">
              连续{currentStreak}天 · 累计{totalBrushedDays}天
            </Text>
          </View>

          <View className="w-full bg-line-light h-1 rounded-full overflow-hidden mb-2">
            <View className="bg-primary h-full" style={{ width: `${Math.min(100, monthGoalProgress)}%` }} />
          </View>

          <View className="grid grid-cols-7 text-center mb-1">
            {WEEKDAYS.map((day) => (
              <Text key={day} className="text-xs font-semibold tracking-[0.02em] text-content-tertiary">
                {day}
              </Text>
            ))}
          </View>

          <View className="grid grid-cols-7 gap-y-2">
            {Array.from({ length: firstDayOfWeek }, (_, index) => (
              <View key={`empty-${index}`} className="h-7" />
            ))}

            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const sessionInfo = daySessionMap.get(dateStr)
              const isToday = dateStr === todayStr
              const isSelected = dateStr === selectedDate

              return (
                <View key={dateStr} className="flex flex-col items-center gap-0" onClick={() => handleSelectDay(day)}>
                  <View
                    className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                      isSelected
                        ? 'bg-primary text-surface-white'
                        : isToday
                          ? 'bg-primary-light text-primary font-bold'
                          : 'text-content'
                    }`}
                  >
                    {day}
                  </View>
                  <View className="flex items-center gap-0.5 h-2.5 mt-0.5">
                    {sessionInfo?.morning && <Text className="text-[11px] leading-none">☀️</Text>}
                    {sessionInfo?.evening && <Text className="text-[11px] leading-none">🌙</Text>}
                  </View>
                </View>
              )
            })}
          </View>

          <View className="mt-2.5 pt-2 border-t border-line-light flex gap-6 justify-center">
            <View className="flex items-center gap-1.5">
              <Text className="text-base leading-none">{SESSION_ICONS.morning}</Text>
              <Text className="text-sm font-medium tracking-[0.02em] text-content-tertiary">晨间</Text>
            </View>
            <View className="flex items-center gap-1.5">
              <Text className="text-base leading-none">{SESSION_ICONS.evening}</Text>
              <Text className="text-sm font-medium tracking-[0.02em] text-content-tertiary">夜间</Text>
            </View>
          </View>
        </View>

        <View className="min-h-0 flex-1">
          {selectedDate && (
            <View className="h-full bg-surface-white rounded-xl p-4 border border-line-light">
              <Text className="text-sm font-bold tracking-tight text-content">{selectedDate}</Text>
              {selectedRecords.filter((record) => record.completed).length > 0 ? (
                <View className="mt-2.5 flex flex-col gap-2">
                  {selectedRecords
                    .filter((record) => record.completed)
                    .map((record) => (
                    <View key={`${record.date}-${record.session}`} className="rounded-xl border border-line-light bg-surface px-3 py-2.5">
                      <View className="flex items-center justify-between">
                      <View className="flex items-center gap-2">
                          <Text className="text-base leading-none">{SESSION_ICONS[record.session]}</Text>
                          <Text className="text-sm font-semibold text-content">{SESSION_LABELS[record.session] ?? '未知时段'}</Text>
                        </View>
                        <Text className="text-sm font-semibold text-primary">完成于 {formatCompletedTime(record.timestamp)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-sm font-medium text-content-tertiary mt-3">当天暂无完成记录。</Text>
              )}
            </View>
          )}
        </View>
      </View>

      <InPageTabBar current="history" />
    </View>
  )
}
