import { View, Text } from '@tarojs/components'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
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

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        'h-10 min-h-10 rounded-xl border px-0 overflow-hidden',
        isSelected
          ? 'bg-primary text-surface border-primary'
          : isToday
            ? 'bg-primary-light border-primary/40 text-primary'
            : 'bg-surface-white border-line-light text-content'
      )}
      aria-label={`${month}月${day}日${isBrushed ? '，已刷牙' : ''}`}
      onClick={() => onSelectDate(dateStr)}
    >
      <View className="relative h-8 w-full flex items-center justify-center">
        <Text
          className={cn(
            'text-xs font-heading',
            isSelected
              ? 'text-surface font-semibold'
              : isToday
                ? 'text-primary font-semibold'
                : 'text-content'
          )}
        >
          {day}
        </Text>

        {isBrushed && (
          <View className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex items-center gap-1">
            {sessionInfo?.morning && <View className="size-2 rounded-full bg-white border border-content/35" />}
            {sessionInfo?.evening && <View className="size-2 rounded-full bg-black" />}
          </View>
        )}
      </View>
    </Button>
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
}: CalendarProps) {
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()

  return (
    <Card className="rounded-3xl bg-surface-white/95">
      <CardHeader className="pb-2">
        <View className="flex items-center justify-between">
          <Text className="text-sm font-heading font-semibold text-content">{formatMonth(year, month)}</Text>
          <View className="flex items-center gap-2">
            <IconButton
              icon="‹"
              ariaLabel="上个月"
              className="border border-line-light bg-surface-white text-content"
              onClick={onPrevMonth}
            />
            <IconButton
              icon="›"
              ariaLabel="下个月"
              className="border border-line-light bg-surface-white text-content"
              onClick={onNextMonth}
            />
          </View>
        </View>

        <View className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">本月 {monthBrushed}</Badge>
          <Badge variant="secondary">连续 {streak}</Badge>
          <Badge variant="secondary">累计 {totalDays}</Badge>
        </View>
      </CardHeader>

      <CardContent className="pt-1">
        <View className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((weekday) => (
            <Text key={weekday} className="text-center text-xs font-heading text-content-secondary py-1">
              {weekday}
            </Text>
          ))}
        </View>

        <View className="grid grid-cols-7 gap-y-1.5 gap-x-1">
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <View key={`empty-${i}`} className="h-10" />
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
