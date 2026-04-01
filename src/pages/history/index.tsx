import { useMemo, useRef, useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { showShareMenu, useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import InPageTabBar from '@/components/InPageTabBar'
import Calendar from '@/components/Calendar'
import iconSun from '@/assets/icons/sun.svg'
import iconMoon from '@/assets/icons/moon.svg'
import { getBusinessAnchorDate, getBusinessDate } from '@/services/dateBoundary'
import { applyLightThemeToChrome } from '@/services/theme'
import { getPageTopPadding } from '@/utils/layout'
import {
  getRecordsByDate,
  getRecordsByMonth,
} from '@/services/recordStorage'
import { getCurrentStreak, getTotalBrushedDays } from '@/services/recordStatsService'
import { generateShareMessage } from '@/services/share'
import type { BrushingRecord } from '@/types'

const SESSION_LABELS = { morning: '晨间', evening: '夜间' } as const
const SESSION_ICONS = { morning: iconSun, evening: iconMoon } as const

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

function parseDateString(dateStr: string): Date | null {
  const parts = dateStr.split('-').map(Number)
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return null
  const [year, month, day] = parts
  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatCompletedTime(timestamp?: number): string {
  if (typeof timestamp !== 'number') return '--:--'
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '--:--'
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

function formatSelectedDate(dateStr: string): string {
  const date = parseDateString(dateStr)
  if (!date) return dateStr
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export default function HistoryPage() {
  const safeTopPadding = getPageTopPadding(20)
  const nowRef = useRef(new Date())
  const now = nowRef.current
  const businessToday = getBusinessAnchorDate(now)

  const [year, setYear] = useState(businessToday.getFullYear())
  const [month, setMonth] = useState(businessToday.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const shareContent = generateShareMessage()

  useShareAppMessage(() => shareContent)
  useShareTimeline(() => ({ title: shareContent.title }))
  useDidShow(() => {
    applyLightThemeToChrome()
    showShareMenu({
      withShareTicket: true,
      showShareItems: ['shareAppMessage', 'shareTimeline'],
    }).catch(() =>
      showShareMenu({
        withShareTicket: true,
      }).catch(() => undefined)
    )
  })

  const monthRecords = useMemo(() => getRecordsByMonth(year, month), [year, month])

  const daySessionMap = useMemo(() => {
    const map = new Map<string, { morning: boolean; evening: boolean }>()
    monthRecords
      .filter((record) => record.completed)
      .forEach((record) => {
        const entry = map.get(record.date) ?? { morning: false, evening: false }
        if (record.session === 'morning') entry.morning = true
        if (record.session === 'evening') entry.evening = true
        map.set(record.date, entry)
      })
    return map
  }, [monthRecords])

  const streak = getCurrentStreak()
  const totalDays = getTotalBrushedDays()
  const monthBrushed = daySessionMap.size
  const daysInMonth = new Date(year, month, 0).getDate()
  const monthRate = daysInMonth > 0 ? Math.round((monthBrushed / daysInMonth) * 100) : 0
  const todayStr = getBusinessDate(now)

  const selectedRecords = useMemo<BrushingRecord[]>(
    () => (selectedDate ? getRecordsByDate(selectedDate) : []),
    [selectedDate]
  )
  const selectedTimes = useMemo(() => {
    const result = { morning: '--:--', evening: '--:--' }
    selectedRecords
      .filter((record) => record.completed)
      .forEach((record) => {
        const time = formatCompletedTime(record.timestamp)
        if (record.session === 'morning') result.morning = time
        if (record.session === 'evening') result.evening = time
      })
    return result
  }, [selectedRecords])

  const handlePrevMonth = () => {
    setSelectedDate(null)
    if (month === 1) {
      setYear((prev) => prev - 1)
      setMonth(12)
      return
    }
    setMonth((prev) => prev - 1)
  }

  const handleNextMonth = () => {
    setSelectedDate(null)
    if (month === 12) {
      setYear((prev) => prev + 1)
      setMonth(1)
      return
    }
    setMonth((prev) => prev + 1)
  }

  return (
    <View className="theme-page theme-day h-screen overflow-hidden">
      <View className="px-page-x max-w-2xl mx-auto h-full pb-bottom-safe flex flex-col" style={{ paddingTop: safeTopPadding }}>
        <Text className="text-display-sm font-body font-medium tracking-tight text-content">
          历史
        </Text>

        <View className="mt-4 rounded-anthropic border border-content/[0.06] bg-surface-white grid grid-cols-3 divide-x divide-content/[0.06]">
          <View className="min-w-0 px-3 py-3.5 flex flex-col items-center justify-center text-center">
            <Text className="text-label-xs font-heading font-semibold tracking-[0.08em] uppercase text-content/45">连续</Text>
            <Text className="mt-1.5 text-paragraph-md font-heading font-bold tabular-nums text-primary leading-none">{streak} 天</Text>
          </View>
          <View className="min-w-0 px-3 py-3.5 flex flex-col items-center justify-center text-center">
            <Text className="text-label-xs font-heading font-semibold tracking-[0.08em] uppercase text-content/45">累计</Text>
            <Text className="mt-1.5 text-paragraph-md font-heading font-bold tabular-nums text-content leading-none">{totalDays} 天</Text>
          </View>
          <View className="min-w-0 px-3 py-3.5 flex flex-col items-center justify-center text-center">
            <Text className="text-label-xs font-heading font-semibold tracking-[0.08em] uppercase text-content/45">本月</Text>
            <Text className="mt-1.5 text-paragraph-md font-heading font-bold tabular-nums text-info leading-none">{monthRate}%</Text>
          </View>
        </View>

        <View className="mt-4 flex-1 min-h-0 overflow-y-auto">
          <Calendar
            year={year}
            month={month}
            todayStr={todayStr}
            selectedDate={selectedDate}
            daySessionMap={daySessionMap}
            monthBrushed={monthBrushed}
            streak={streak}
            totalDays={totalDays}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onSelectDate={setSelectedDate}
            hideStats
          />

          <View className="mt-3 rounded-anthropic border border-content/[0.06] bg-surface-white p-4">
            <View className="flex items-baseline justify-between">
              <Text className="text-label-xs font-heading font-semibold tracking-[0.1em] uppercase text-content/45">当天记录</Text>
              {selectedDate && (
                <Text className="text-paragraph-sm font-heading text-content-secondary">
                  {formatSelectedDate(selectedDate)}
                </Text>
              )}
            </View>
            {selectedDate ? (
              <View className="mt-3 grid grid-cols-2 gap-2">
                {(['morning', 'evening'] as const).map((session) => (
                  <View
                    key={session}
                    className="rounded-anthropic-sm border border-content/[0.06] bg-primary-light/70 px-3 py-2.5 flex items-center justify-between"
                  >
                    <View className="flex items-center gap-1.5">
                      <Image src={SESSION_ICONS[session]} className="size-4" mode="aspectFit" />
                      <Text className="text-label-xs font-heading font-semibold tracking-[0.08em] uppercase text-content/50">
                        {SESSION_LABELS[session]}
                      </Text>
                    </View>
                    <Text className="text-paragraph-md font-heading font-bold tabular-nums text-primary ml-2">
                      {selectedTimes[session]}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="mt-2 text-paragraph-sm text-content/35">请选择日期查看晨间和夜间时间</Text>
            )}
          </View>
        </View>
      </View>

      <InPageTabBar current="history" />
    </View>
  )
}
