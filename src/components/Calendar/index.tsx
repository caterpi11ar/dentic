import { View, Text } from '@tarojs/components'
import ShadButton from '../ui/ShadButton'
import ShadBadge from '../ui/ShadBadge'
import { ShadCard, ShadCardContent, ShadCardHeader } from '../ui/ShadCard'

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

function formatMonth(year: number, month: number): string {
  return `${year}年 ${month}月`
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
    <ShadCard className="rounded-3xl bg-surface-white/95">
      <ShadCardHeader className="pb-2">
        <View className="flex items-center justify-between">
          <Text className="text-sm font-semibold text-content">{formatMonth(year, month)}</Text>
          <View className="flex items-center gap-2">
            <ShadButton variant="ghost" fullWidth={false} className="min-h-9 min-w-9 px-0" onClick={onPrevMonth} aria-label="上个月">
              ‹
            </ShadButton>
            <ShadButton variant="ghost" fullWidth={false} className="min-h-9 min-w-9 px-0" onClick={onNextMonth} aria-label="下个月">
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
          {WEEKDAYS.map((weekday) => (
            <Text key={weekday} className="text-center text-xs text-content-secondary py-1">
              {weekday}
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
                key={dateStr}
                className="flex items-center justify-center h-10"
                onClick={() => onSelectDate(dateStr)}
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
