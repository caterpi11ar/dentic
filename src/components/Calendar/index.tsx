import { useState, useMemo, useRef } from 'react'
import { View, Text } from '@tarojs/components'
import {
  getRecordsByMonth,
  getCurrentStreak,
  getTotalBrushedDays,
  formatDate,
} from '../../services/storage'
import ShadButton from '../ui/ShadButton'
import ShadBadge from '../ui/ShadBadge'
import { ShadCard, ShadCardContent, ShadCardHeader } from '../ui/ShadCard'
import type { BrushingRecord } from '../../types'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

interface Props {
  onSelectDate?: (date: string) => void
}

function formatMonth(year: number, month: number): string {
  return `${year}年 ${month}月`
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
        if (r.session === 'evening') entry.evening = true
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
    if (month === 1) {
      setYear(year - 1)
      setMonth(12)
      return
    }
    setMonth(month - 1)
  }

  const goToNextMonth = () => {
    if (month === 12) {
      setYear(year + 1)
      setMonth(1)
      return
    }
    setMonth(month + 1)
  }

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
    onSelectDate?.(dateStr)
  }

  return (
    <ShadCard className="rounded-3xl bg-surface-white/95">
      <ShadCardHeader className="pb-2">
        <View className="flex items-center justify-between">
          <Text className="text-sm font-semibold text-content">{formatMonth(year, month)}</Text>
          <View className="flex items-center gap-2">
            <ShadButton variant="ghost" fullWidth={false} className="min-h-9 min-w-9 px-0" onClick={goToPrevMonth} aria-label="上个月">
              ‹
            </ShadButton>
            <ShadButton variant="ghost" fullWidth={false} className="min-h-9 min-w-9 px-0" onClick={goToNextMonth} aria-label="下个月">
              ›
            </ShadButton>
          </View>
        </View>

        <View className="mt-3 flex flex-wrap items-center gap-2">
          <ShadBadge variant="secondary">本月 {monthBrushed}</ShadBadge>
          <ShadBadge variant="secondary">连续 {streak}</ShadBadge>
          <ShadBadge variant="secondary">累计 {totalDays}</ShadBadge>
        </View>
      </ShadCardHeader>

      <ShadCardContent className="pt-1">
        <View className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((w) => (
            <Text key={w} className="text-center text-xs text-content-secondary py-1">
              {w}
            </Text>
          ))}
        </View>

        <View className="grid grid-cols-7 gap-y-1.5">
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
                  className={`size-9 rounded-lg flex items-center justify-center relative border ${
                    isSelected
                      ? 'bg-primary text-surface border-primary'
                      : isToday
                        ? 'bg-primary-light border-primary/40'
                        : 'bg-surface-white border-line-light'
                  }`}
                >
                  <Text
                    className={`text-xs ${
                      isSelected
                        ? 'text-surface font-semibold'
                        : isToday
                          ? 'text-primary font-semibold'
                          : 'text-content'
                    }`}
                  >
                    {day}
                  </Text>

                  {isBrushed && (
                    <View className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1">
                      {sessionInfo.morning && <View className="size-1.5 rounded-full bg-warning" />}
                      {sessionInfo.evening && <View className="size-1.5 rounded-full bg-primary" />}
                    </View>
                  )}
                </View>
              </View>
            )
          })}
        </View>
      </ShadCardContent>
    </ShadCard>
  )
}
