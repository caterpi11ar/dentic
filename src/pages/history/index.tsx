import type { BrushingRecord } from '@/types'
import { Image, Text, View } from '@tarojs/components'
import { showShareMenu, useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { useMemo, useRef, useState } from 'react'
import iconMoon from '@/assets/icons/moon.svg'
import iconSun from '@/assets/icons/sun.svg'
import AiWeeklyReport from '@/components/AiWeeklyReport'
import Calendar from '@/components/Calendar'
import InPageTabBar from '@/components/InPageTabBar'
import PageLayout from '@/components/PageLayout'
import { getBusinessAnchorDate, getBusinessDate } from '@/services/dateBoundary'
import { getCurrentStreak, getTotalBrushedDays } from '@/services/recordStatsService'
import { generateShareMessage } from '@/services/share'
import { applyLightThemeToChrome } from '@/services/theme'
import { recordsStore, useRecordsStore } from '@/stores/records'

const SESSION_LABELS = { morning: '晨间', evening: '夜间' } as const
const SESSION_ICONS = { morning: iconSun, evening: iconMoon } as const

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

function parseDateString(dateStr: string): Date | null {
  const parts = dateStr.split('-').map(Number)
  if (parts.length !== 3 || parts.some(part => Number.isNaN(part)))
    return null
  const [year, month, day] = parts
  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatCompletedTime(timestamp?: number): string {
  if (typeof timestamp !== 'number')
    return '--:--'
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime()))
    return '--:--'
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

function formatSelectedDate(dateStr: string): string {
  const date = parseDateString(dateStr)
  if (!date)
    return dateStr
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export default function HistoryPage() {
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
      }).catch(() => undefined),
    )
  })

  const prefix = `${year}-${String(month).padStart(2, '0')}`
  const allRecords = useRecordsStore(state => state.records)
  const monthRecords = useMemo(() => allRecords.filter(r => r.date.startsWith(prefix)), [allRecords, prefix])
  const streak = getCurrentStreak()
  const totalDays = getTotalBrushedDays()

  const daySessionMap = useMemo(() => {
    const map = new Map<string, { morning: boolean, evening: boolean }>()
    monthRecords
      .filter(record => record.completed)
      .forEach((record) => {
        const entry = map.get(record.date) ?? { morning: false, evening: false }
        if (record.session === 'morning')
          entry.morning = true
        if (record.session === 'evening')
          entry.evening = true
        map.set(record.date, entry)
      })
    return map
  }, [monthRecords])
  const monthBrushed = daySessionMap.size
  const daysInMonth = new Date(year, month, 0).getDate()
  const monthRate = daysInMonth > 0 ? Math.round((monthBrushed / daysInMonth) * 100) : 0
  const todayStr = getBusinessDate(now)

  const selectedRecords = useMemo<BrushingRecord[]>(
    () =>
      selectedDate
        ? recordsStore.getState().records.filter(r => r.date === selectedDate)
        : [],
    [selectedDate],
  )
  const selectedTimes = useMemo(() => {
    const result = { morning: '--:--', evening: '--:--' }
    selectedRecords
      .filter(record => record.completed)
      .forEach((record) => {
        const time = formatCompletedTime(record.timestamp)
        if (record.session === 'morning')
          result.morning = time
        if (record.session === 'evening')
          result.evening = time
      })
    return result
  }, [selectedRecords])

  const handlePrevMonth = () => {
    setSelectedDate(null)
    if (month === 1) {
      setYear(prev => prev - 1)
      setMonth(12)
      return
    }
    setMonth(prev => prev - 1)
  }

  const handleNextMonth = () => {
    setSelectedDate(null)
    if (month === 12) {
      setYear(prev => prev + 1)
      setMonth(1)
      return
    }
    setMonth(prev => prev + 1)
  }

  return (
    <PageLayout>
      <Text className="text-display-md font-body font-medium tracking-tight text-content">
        历史
      </Text>

      <View className="mt-3 flex items-center gap-3">
        <Text className="text-paragraph-sm font-body font-semibold tabular-nums text-primary">
          {streak}
          <Text className="text-label-xs text-content-tertiary ml-0.5">天连续</Text>
        </Text>
        <Text className="text-paragraph-sm font-body font-semibold tabular-nums text-content">
          {totalDays}
          <Text className="text-label-xs text-content-tertiary ml-0.5">天累计</Text>
        </Text>
        <Text className="text-paragraph-sm font-body font-semibold tabular-nums text-primary">
          {monthRate}
          <Text className="text-label-xs text-content-tertiary ml-0.5">%本月</Text>
        </Text>
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

        <AiWeeklyReport />

        <View className="mt-5 rounded-anthropic border border-line bg-surface-white p-4">
          <View className="flex items-baseline justify-between">
            <Text className="text-label-sm font-body font-semibold tracking-[0.08em] uppercase text-content-tertiary">当天记录</Text>
            {selectedDate && (
              <Text className="text-paragraph-sm font-heading text-content-secondary">
                {formatSelectedDate(selectedDate)}
              </Text>
            )}
          </View>
          {selectedDate ? (
            <View className="mt-3 grid grid-cols-2 gap-2">
              {(['morning', 'evening'] as const).map(session => (
                <View
                  key={session}
                  className="rounded-anthropic-sm border border-line bg-primary-light/70 px-3 py-2.5 flex items-center justify-between"
                >
                  <View className="flex items-center gap-1.5">
                    <Image src={SESSION_ICONS[session]} className="size-4" mode="aspectFit" />
                    <Text className="text-label-xs font-heading font-semibold tracking-[0.08em] uppercase text-content-tertiary">
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
            <Text className="mt-2 text-paragraph-sm text-content-disabled">请选择日期查看晨间和夜间时间</Text>
          )}
        </View>
      </View>

      <InPageTabBar current="history" />
    </PageLayout>
  )
}
