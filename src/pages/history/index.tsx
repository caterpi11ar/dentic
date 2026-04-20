import type { TabOption } from '@/components/ui/Tabs'
import type { DayCompletion } from '@/services/recordStatsService'
import type { BrushingRecord } from '@/types'
import { Image, Text, View } from '@tarojs/components'
import { showShareMenu, useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { useMemo, useRef, useState } from 'react'
import iconMoon from '@/assets/icons/moon.svg'
import iconSun from '@/assets/icons/sun.svg'
import Calendar from '@/components/Calendar'
import InPageTabBar from '@/components/InPageTabBar'
import PageLayout from '@/components/PageLayout'
import RingPair from '@/components/RingPair'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/components/ui/cn'
import PageHeader from '@/components/ui/PageHeader'
import StatRow from '@/components/ui/StatRow'
import Tabs from '@/components/ui/Tabs'
import WeekStrip from '@/components/WeekStrip'
import { getBusinessAnchorDate, getBusinessDate } from '@/services/dateBoundary'
import {
  getCurrentStreak,
  getMonthCompletionMap,
  getTotalBrushedDays,
  getWeekCompletionMap,
} from '@/services/recordStatsService'
import { generateShareMessage } from '@/services/share'
import { applyLightThemeToChrome } from '@/services/theme'
import { useRecordsStore } from '@/stores/records'

const SESSION_LABELS = { morning: '晨间', evening: '夜间' } as const
const SESSION_ICONS = { morning: iconSun, evening: iconMoon } as const
const WEEKDAY_CN = ['日', '一', '二', '三', '四', '五', '六']

type ViewMode = 'detail' | 'month'

const VIEW_TABS: Array<TabOption<ViewMode>> = [
  { value: 'detail', label: '近况' },
  { value: 'month', label: '全部' },
]

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

interface StatsTriple {
  streak: number
  totalDays: number
  monthRate: number
}

function StatsRow({ streak, totalDays, monthRate }: StatsTriple) {
  return (
    <View className="flex items-start gap-6">
      <StatRow label="连续" value={streak} unit="天" tone="primary" />
      <StatRow label="累计" value={totalDays} unit="天" />
      <StatRow label="本月" value={monthRate} unit="%" tone="primary" />
    </View>
  )
}

interface DetailViewProps {
  selectedDate: string
  todayStr: string
  weekCompletionMap: Map<string, DayCompletion>
  selectedTimes: { morning: string, evening: string }
  onSelectDate: (date: string) => void
}

function DetailView({
  selectedDate,
  todayStr,
  weekCompletionMap,
  selectedTimes,
  onSelectDate,
}: DetailViewProps) {
  const date = parseDateString(selectedDate)
  const dayNum = date?.getDate() ?? 0
  const monthNum = date ? date.getMonth() + 1 : 0
  const weekdayChar = date ? WEEKDAY_CN[date.getDay()] : ''
  const dayCompletion = weekCompletionMap.get(selectedDate) ?? { morning: false, evening: false }
  const isFuture = selectedDate > todayStr

  return (
    <>
      <WeekStrip
        anchorDate={selectedDate}
        selectedDate={selectedDate}
        todayStr={todayStr}
        completionMap={weekCompletionMap}
        onSelectDate={onSelectDate}
      />

      <View className="mt-5 flex flex-col items-center">
        <RingPair
          morning={dayCompletion.morning}
          evening={dayCompletion.evening}
          size={208}
          variant={isFuture ? 'skeleton' : 'filled'}
        >
          <View className="flex flex-col items-center">
            <Text className="text-display-lg font-heading font-medium tabular-nums text-content leading-none">
              {dayNum}
            </Text>
            <Text className="mt-1.5 text-label-sm text-content-tertiary">
              {`${monthNum}月 · 周${weekdayChar}`}
            </Text>
          </View>
        </RingPair>
      </View>

      <Card className="mt-5">
        <CardContent variant="dense">
          <View className="flex items-baseline justify-between">
            <Text className="text-label-sm uppercase text-content-tertiary">当天记录</Text>
            <Text className="text-paragraph-sm font-body text-content-secondary">
              {formatSelectedDate(selectedDate)}
            </Text>
          </View>
          <View className="mt-3 grid grid-cols-2 gap-2">
            {(['morning', 'evening'] as const).map(session => (
              <View
                key={session}
                className="rounded-anthropic-sm border border-line bg-surface-white px-3 py-2.5 flex items-center justify-between"
              >
                <View className="flex items-center gap-1.5">
                  <Image src={SESSION_ICONS[session]} className="size-4" mode="aspectFit" />
                  <Text className="text-label-xs uppercase text-content-tertiary">
                    {SESSION_LABELS[session]}
                  </Text>
                </View>
                <Text className="text-paragraph-md font-body font-semibold tabular-nums text-content ml-2">
                  {selectedTimes[session]}
                </Text>
              </View>
            ))}
          </View>
        </CardContent>
      </Card>
    </>
  )
}

interface MonthViewProps {
  year: number
  month: number
  todayStr: string
  selectedDate: string
  daySessionMap: Map<string, DayCompletion>
  monthBrushed: number
  streak: number
  totalDays: number
  onPrevMonth: () => void
  onNextMonth: () => void
  onSelectDate: (date: string) => void
}

function MonthView({
  year,
  month,
  todayStr,
  selectedDate,
  daySessionMap,
  streak,
  totalDays,
  monthBrushed,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}: MonthViewProps) {
  return (
    <Calendar
      year={year}
      month={month}
      todayStr={todayStr}
      selectedDate={selectedDate}
      daySessionMap={daySessionMap}
      monthBrushed={monthBrushed}
      streak={streak}
      totalDays={totalDays}
      onPrevMonth={onPrevMonth}
      onNextMonth={onNextMonth}
      onSelectDate={onSelectDate}
      hideStats
    />
  )
}

export default function HistoryPage() {
  const nowRef = useRef(new Date())
  const now = nowRef.current
  const businessToday = getBusinessAnchorDate(now)
  const todayStr = getBusinessDate(now)

  const [year, setYear] = useState(businessToday.getFullYear())
  const [month, setMonth] = useState(businessToday.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const [viewMode, setViewMode] = useState<ViewMode>('detail')

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

  const allRecords = useRecordsStore(state => state.records)
  const daySessionMap = useMemo(
    () => getMonthCompletionMap(year, month),
    [allRecords, year, month],
  )
  const weekCompletionMap = useMemo(
    () => getWeekCompletionMap(selectedDate),
    [allRecords, selectedDate],
  )
  const streak = getCurrentStreak()
  const totalDays = getTotalBrushedDays()
  const monthBrushed = daySessionMap.size
  const daysInMonth = new Date(year, month, 0).getDate()
  const monthRate = daysInMonth > 0 ? Math.round((monthBrushed / daysInMonth) * 100) : 0

  const selectedRecords = useMemo<BrushingRecord[]>(
    () => allRecords.filter(r => r.date === selectedDate),
    [allRecords, selectedDate],
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
    if (month === 1) {
      const prevYear = year - 1
      setYear(prevYear)
      setMonth(12)
      setSelectedDate(`${prevYear}-12-01`)
      return
    }
    const prevMonth = month - 1
    setMonth(prevMonth)
    setSelectedDate(`${year}-${pad2(prevMonth)}-01`)
  }

  const handleNextMonth = () => {
    if (month === 12) {
      const nextYear = year + 1
      setYear(nextYear)
      setMonth(1)
      setSelectedDate(`${nextYear}-01-01`)
      return
    }
    const nextMonth = month + 1
    setMonth(nextMonth)
    setSelectedDate(`${year}-${pad2(nextMonth)}-01`)
  }

  const syncYearMonthFromDate = (date: string) => {
    const parsed = parseDateString(date)
    if (!parsed)
      return
    setYear(parsed.getFullYear())
    setMonth(parsed.getMonth() + 1)
  }

  const handleSelectDateInMonth = (date: string) => {
    syncYearMonthFromDate(date)
    setSelectedDate(date)
    setViewMode('detail')
  }

  const handleSelectDateInDetail = (date: string) => {
    syncYearMonthFromDate(date)
    setSelectedDate(date)
  }

  return (
    <PageLayout>
      <PageHeader title="历史" />

      <Tabs
        value={viewMode}
        options={VIEW_TABS}
        onValueChange={setViewMode}
        className="w-full"
      />

      <View className="mt-page-gap">
        <StatsRow streak={streak} totalDays={totalDays} monthRate={monthRate} />
      </View>

      <View
        className={cn(
          'mt-page-gap flex-1 min-h-0',
          viewMode === 'month' ? 'overflow-y-auto' : 'overflow-hidden',
        )}
      >
        {viewMode === 'detail'
          ? (
              <DetailView
                selectedDate={selectedDate}
                todayStr={todayStr}
                weekCompletionMap={weekCompletionMap}
                selectedTimes={selectedTimes}
                onSelectDate={handleSelectDateInDetail}
              />
            )
          : (
              <MonthView
                year={year}
                month={month}
                todayStr={todayStr}
                selectedDate={selectedDate}
                daySessionMap={daySessionMap}
                streak={streak}
                totalDays={totalDays}
                monthBrushed={monthBrushed}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onSelectDate={handleSelectDateInMonth}
              />
            )}
      </View>

      <InPageTabBar current="history" />
    </PageLayout>
  )
}
