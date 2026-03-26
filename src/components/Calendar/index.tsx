import { View, Text } from '@tarojs/components'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import Badge from '@/components/ui/Badge'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import IconButton from '@/components/ui/IconButton'
import { cn } from '@/components/ui/cn'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

type DaySessionInfo = {
  morning: boolean
  evening: boolean
}

interface CalendarProps {
  year: number
  month: number
  todayStr: string
  selectedDate: string | null
  daySessionMap: Map<string, DaySessionInfo>
  monthBrushed: number
  streak: number
  totalDays: number
  onPrevMonth: () => void
  onNextMonth: () => void
  onSelectDate: (date: string) => void
  hideStats?: boolean
  hideHeader?: boolean
}

interface CalendarDayButtonProps {
  day: number
  month: number
  dateStr: string
  isToday: boolean
  isSelected: boolean
  sessionInfo?: DaySessionInfo
  onSelectDate: (date: string) => void
}

function formatMonth(year: number, month: number): string {
  return `${year}年 ${month}月`
}

function CalendarDayButton({
  day,
  month,
  dateStr,
  isToday,
  isSelected,
  sessionInfo,
  onSelectDate,
}: CalendarDayButtonProps) {
  const isBrushed = !!sessionInfo
  const handleActivate = () => onSelectDate(dateStr)
  const handleKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    handleActivate()
  }

  return (
    <View
      className={cn(
        'h-9 rounded-md border overflow-hidden relative',
        isSelected
          ? 'bg-primary text-surface border-primary'
          : isToday
            ? 'bg-primary-light border-primary/40 text-primary'
            : 'bg-surface-white border-content/[0.06] text-content'
      )}
      aria-label={`${month}月${day}日${isBrushed ? '，已刷牙' : ''}`}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
    >
      <View className="h-full w-full flex items-center justify-center">
        <Text
          className={cn(
            'text-label-xs font-heading',
            isSelected
              ? 'text-surface font-semibold'
              : isToday
                ? 'text-primary font-semibold'
                : 'text-content'
          )}
        >
          {day}
        </Text>
      </View>

      {isBrushed && (
        <View className="absolute bottom-0 left-0 right-0 flex">
          <View className={cn('h-0.5 w-1/2', sessionInfo?.morning ? 'bg-amber-400' : 'bg-transparent')} />
          <View className={cn('h-0.5 w-1/2', sessionInfo?.evening ? 'bg-indigo-400' : 'bg-transparent')} />
        </View>
      )}
    </View>
  )
}

export default function Calendar({
  year,
  month,
  todayStr,
  selectedDate,
  daySessionMap,
  monthBrushed,
  streak,
  totalDays,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  hideStats,
  hideHeader,
}: CalendarProps) {
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()

  return (
    <Card className="rounded-anthropic bg-surface-white border border-content/[0.06]">
      {!hideHeader && (
        <CardHeader className="px-4 pt-4 pb-1.5">
          <View className="flex items-center justify-between">
            <Text className="text-label-sm font-heading font-semibold tracking-[0.08em] uppercase text-content/60">
              {formatMonth(year, month)}
            </Text>
            <View className="flex items-center gap-2">
              <IconButton
                icon="‹"
                ariaLabel="上个月"
                className="size-9 min-h-9 min-w-9 border border-content/[0.06] bg-surface-white text-content"
                onClick={onPrevMonth}
              />
              <IconButton
                icon="›"
                ariaLabel="下个月"
                className="size-9 min-h-9 min-w-9 border border-content/[0.06] bg-surface-white text-content"
                onClick={onNextMonth}
              />
            </View>
          </View>

          {!hideStats && (
            <View className="mt-2.5 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">本月 {monthBrushed}</Badge>
              <Badge variant="secondary">连续 {streak}</Badge>
              <Badge variant="secondary">累计 {totalDays}</Badge>
            </View>
          )}
        </CardHeader>
      )}

      <CardContent className="pt-1 px-4 pb-4">
        <View className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((weekday) => (
            <Text key={weekday} className="text-center text-label-xs font-heading text-content/40 py-1 uppercase">
              {weekday}
            </Text>
          ))}
        </View>

        <View className="grid grid-cols-7 gap-y-1 gap-x-1">
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <View key={`empty-${i}`} className="h-9" />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const sessionInfo = daySessionMap.get(dateStr)
            const isToday = dateStr === todayStr
            const isSelected = dateStr === selectedDate

            return (
              <CalendarDayButton
                key={dateStr}
                day={day}
                month={month}
                dateStr={dateStr}
                sessionInfo={sessionInfo}
                isToday={isToday}
                isSelected={isSelected}
                onSelectDate={onSelectDate}
              />
            )
          })}
        </View>
      </CardContent>
    </Card>
  )
}
