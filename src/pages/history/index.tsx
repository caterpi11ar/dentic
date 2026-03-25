import { useMemo, useRef, useState } from 'react'
import { View, Text } from '@tarojs/components'
import { showShareMenu, useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import InPageTabBar from '@/components/InPageTabBar'
import Calendar from '@/components/Calendar'
import { List, ListItem } from '@/components/ui/List'
import Section from '@/components/ui/Section'
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
      <View className="pb-32 px-page-x max-w-2xl mx-auto flex flex-col gap-4" style={{ paddingTop: safeTopPadding }}>
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
        />

        <Section
          title={selectedDate ? `${selectedDate} 记录` : '选择日期查看详情'}
          className="min-h-[180px]"
        >
          {selectedDate ? (
            completedRecords.length > 0 ? (
              <List className="mt-1">
                {completedRecords.map((record) => (
                  <ListItem
                    key={`${record.date}-${record.session}`}
                    title={SESSION_LABELS[record.session] ?? '未知时段'}
                    left={<Text className="text-base leading-none">{SESSION_ICONS[record.session]}</Text>}
                    right={<Text className="text-paragraph-sm font-semibold text-primary">完成于 {formatCompletedTime(record.timestamp)}</Text>}
                  />
                ))}
              </List>
            ) : (
              <Text className="text-paragraph-sm text-content/40 mt-3">当天暂无完成记录。</Text>
            )
          ) : (
            <Text className="text-paragraph-sm text-content/40 mt-3">点击上方日历日期后展示晨间/夜间完成记录。</Text>
          )}
        </Section>

      </View>

      <InPageTabBar current="history" />
    </View>
  )
}
