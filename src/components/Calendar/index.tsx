import { useState, useMemo, useRef } from 'react'
import { View, Text } from '@tarojs/components'
import {
  getRecordsByMonth,
  getCurrentStreak,
  getTotalBrushedDays,
  formatDate,
} from '../../services/storage'
import type { BrushingRecord } from '../../types'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

interface Props {
  onSelectDate?: (date: string) => void
}

export default function Calendar({ onSelectDate }: Props) {
  const todayRef = useRef(new Date())
  const today = todayRef.current
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const records = useMemo(() => getRecordsByMonth(year, month), [year, month])

  const daySessionMap = useMemo(() => {
    const map = new Map<string, { morning: boolean; evening: boolean }>()
    records
      .filter((r: BrushingRecord) => r.completed)
      .forEach((r: BrushingRecord) => {
        const entry = map.get(r.date) ?? { morning: false, evening: false }
        if (r.session === 'morning') entry.morning = true
        else if (r.session === 'evening') entry.evening = true
        map.set(r.date, entry)
      })
    return map
  }, [records])

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()

  // eslint-disable-next-line react-hooks/exhaustive-deps -- records triggers recompute
  const streak = useMemo(() => getCurrentStreak(), [records])
  // eslint-disable-next-line react-hooks/exhaustive-deps -- records triggers recompute
  const totalDays = useMemo(() => getTotalBrushedDays(), [records])
  const monthBrushed = useMemo(() => daySessionMap.size, [daySessionMap])

  const todayStr = formatDate(today)

  const goToPrevMonth = () => {
    if (month === 1) { setYear(year - 1); setMonth(12) }
    else setMonth(month - 1)
  }

  const goToNextMonth = () => {
    if (month === 12) { setYear(year + 1); setMonth(1) }
    else setMonth(month + 1)
  }

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
    onSelectDate?.(dateStr)
  }

  return (
    <View className="bg-surface-white rounded-2xl shadow-card-lg overflow-hidden">
      {/* 统计条 */}
      <View className="flex bg-surface">
        <View className="flex-1 py-3 flex flex-col items-center">
          <Text className="text-lg font-bold text-primary tabular-nums">{monthBrushed}</Text>
          <Text className="text-xs text-content-secondary">本月</Text>
        </View>
        <View className="w-px bg-line-light my-2" />
        <View className="flex-1 py-3 flex flex-col items-center">
          <Text className="text-lg font-bold text-warning tabular-nums">{streak}</Text>
          <Text className="text-xs text-content-secondary">连续</Text>
        </View>
        <View className="w-px bg-line-light my-2" />
        <View className="flex-1 py-3 flex flex-col items-center">
          <Text className="text-lg font-bold text-success-dark tabular-nums">{totalDays}</Text>
          <Text className="text-xs text-content-secondary">总计</Text>
        </View>
      </View>

      <View className="p-4">
        {/* 月份导航 */}
        <View className="flex items-center justify-between mb-3">
          <View className="size-8 rounded-full bg-surface flex items-center justify-center" onClick={goToPrevMonth} role="button" aria-label="上个月">
            <Text className="text-sm text-content-secondary font-bold">‹</Text>
          </View>
          <Text className="text-sm font-bold text-content">
            {year}年{month}月
          </Text>
          <View className="size-8 rounded-full bg-surface flex items-center justify-center" onClick={goToNextMonth} role="button" aria-label="下个月">
            <Text className="text-sm text-content-secondary font-bold">›</Text>
          </View>
        </View>

        {/* 星期标题 */}
        <View className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((w) => (
            <Text key={w} className="text-center text-xs text-content-disabled py-1">
              {w}
            </Text>
          ))}
        </View>

        {/* 日期格子 */}
        <View className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <View key={`empty-${i}`} className="h-10" />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const sessionInfo = daySessionMap.get(dateStr)
            const isBrushed = !!sessionInfo
            const isToday = dateStr === todayStr
            const isSelected = dateStr === selectedDate

            return (
              <View
                key={day}
                className="flex items-center justify-center h-10"
                onClick={() => handleDayClick(day)}
                role="button"
                aria-label={`${month}月${day}日${isBrushed ? '，已刷牙' : ''}`}
              >
                <View
                  className={`size-9 rounded-full flex items-center justify-center relative transition-colors duration-200 motion-reduce:transition-none ${
                    isSelected
                      ? 'bg-primary'
                      : isToday
                        ? 'bg-primary-light'
                        : ''
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      isSelected
                        ? 'text-surface-white font-bold'
                        : isToday
                          ? 'text-primary font-bold'
                          : isBrushed
                            ? 'text-content font-medium'
                            : 'text-content'
                    }`}
                  >
                    {day}
                  </Text>
                  {isBrushed && !isSelected && (
                    <View className="absolute -bottom-0.5 flex gap-0.5">
                      {sessionInfo.morning && <View className="size-1 rounded-full bg-warning" />}
                      {sessionInfo.evening && <View className="size-1 rounded-full bg-primary" />}
                    </View>
                  )}
                </View>
              </View>
            )
          })}
        </View>
      </View>
    </View>
  )
}
