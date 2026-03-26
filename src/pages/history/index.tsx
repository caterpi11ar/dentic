import { useMemo, useRef, useState } from 'react'
import { View, Text } from '@tarojs/components'
import { showShareMenu, useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import InPageTabBar from '@/components/InPageTabBar'
import Calendar from '@/components/Calendar'
import IconButton from '@/components/ui/IconButton'
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
const SESSION_ICONS = { morning: '☀️', evening: '🌙' } as const

function formatCompletedTime(timestamp?: number): string {
  if (typeof timestamp !== 'number') return '--:--'
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '--:--'
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function formatSelectedDate(dateStr: string): string {
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  return `${Number(parts[1])}月${Number(parts[2])}日`
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

  const selectedRecords: BrushingRecord[] = selectedDate ? getRecordsByDate(selectedDate) : []
  const completedRecords = selectedRecords.filter((record) => record.completed)

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
    <View className="theme-page app-scroll theme-day min-h-screen">
      <View className="pb-bottom-safe px-page-x max-w-2xl mx-auto flex flex-col" style={{ paddingTop: safeTopPadding }}>

        {/* ── 编辑式页面标题 ── */}
        <Text className="text-display-sm font-body font-medium tracking-tight text-content">
          历史
        </Text>

        {/* ── 三列统计网格 ── */}
        <View className="mt-6 grid grid-cols-3 gap-3">
          <View className="rounded-anthropic border border-content/[0.06] bg-surface-white p-4 flex flex-col items-center">
            <Text className="text-display-md font-heading font-bold tabular-nums text-primary">{streak}</Text>
            <Text className="mt-1 text-label-xs font-heading font-medium tracking-wider text-content/40 uppercase">连续</Text>
          </View>
          <View className="rounded-anthropic border border-content/[0.06] bg-surface-white p-4 flex flex-col items-center">
            <Text className="text-display-md font-heading font-bold tabular-nums text-content">{totalDays}</Text>
            <Text className="mt-1 text-label-xs font-heading font-medium tracking-wider text-content/40 uppercase">总天数</Text>
          </View>
          <View className="rounded-anthropic border border-content/[0.06] bg-surface-white p-4 flex flex-col items-center">
            <Text className="text-display-md font-heading font-bold tabular-nums text-info">{monthRate}%</Text>
            <Text className="mt-1 text-label-xs font-heading font-medium tracking-wider text-content/40 uppercase">本月</Text>
          </View>
        </View>

        {/* ── 标签式月份导航 ── */}
        <View className="mt-8 flex items-center gap-3">
          <Text className="text-label-sm font-heading font-semibold tracking-[0.1em] uppercase text-content/50 shrink-0">
            {month}月
          </Text>
          <View className="flex-1 h-px bg-content/[0.08]" />
          <View className="flex items-center gap-1.5 shrink-0">
            <IconButton
              icon="‹"
              ariaLabel="上个月"
              className="border border-content/[0.06] bg-surface-white text-content"
              onClick={handlePrevMonth}
            />
            <IconButton
              icon="›"
              ariaLabel="下个月"
              className="border border-content/[0.06] bg-surface-white text-content"
              onClick={handleNextMonth}
            />
          </View>
        </View>

        {/* ── 日历网格 ── */}
        <View className="mt-4">
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
            hideHeader
          />
        </View>

        {/* ── 日期详情：时间线式 ── */}
        <View className="mt-8">
          {selectedDate ? (
            <View>
              {/* 大号日期标题 + 装饰线 */}
              <Text className="text-display-sm font-body font-medium tracking-tight text-content">
                {formatSelectedDate(selectedDate)}
              </Text>
              <View className="mt-2 w-8 h-0.5 bg-primary/60 rounded-full" />

              {completedRecords.length > 0 ? (
                <View className="mt-6 pl-4 border-l-2 border-content/[0.06] flex flex-col gap-5">
                  {completedRecords.map((record) => (
                    <View key={`${record.date}-${record.session}`} className="relative">
                      {/* 时间线圆点 */}
                      <View className="absolute -left-[1.3125rem] top-1 size-2.5 rounded-full bg-primary border-2 border-surface" />

                      <View className="flex items-start gap-3">
                        <Text className="text-xl leading-none mt-px">
                          {SESSION_ICONS[record.session]}
                        </Text>
                        <View className="flex-1 min-w-0">
                          <Text className="text-paragraph-sm font-heading font-semibold text-content">
                            {SESSION_LABELS[record.session] ?? '未知时段'}
                          </Text>
                          <Text className="mt-1 text-paragraph-md font-heading font-bold tabular-nums text-primary">
                            {formatCompletedTime(record.timestamp)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="mt-6 py-8 flex flex-col items-center">
                  <Text className="text-display-md leading-none">🦷</Text>
                  <Text className="mt-3 text-paragraph-sm text-content/30">当天暂无完成记录</Text>
                </View>
              )}
            </View>
          ) : (
            <View className="py-10 flex flex-col items-center">
              <Text className="text-display-md leading-none text-content/15">📅</Text>
              <Text className="mt-3 text-paragraph-sm text-content/30">点击日历中的日期查看详情</Text>
            </View>
          )}
        </View>

      </View>

      <InPageTabBar current="history" />
    </View>
  )
}
