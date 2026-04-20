import { Text, View } from '@tarojs/components'
import RingPair from '@/components/RingPair'
import { cn } from '@/components/ui/cn'
import { getWeekDates } from '@/services/dateBoundary'

interface DayCompletion {
  morning: boolean
  evening: boolean
}

interface WeekStripProps {
  anchorDate: string
  selectedDate: string
  todayStr: string
  completionMap: Map<string, DayCompletion>
  onSelectDate: (date: string) => void
}

const WEEKDAY_CHAR = ['一', '二', '三', '四', '五', '六', '日']

function getDayNumber(dateStr: string): number {
  return Number(dateStr.split('-')[2])
}

export default function WeekStrip({
  anchorDate,
  selectedDate,
  todayStr,
  completionMap,
  onSelectDate,
}: WeekStripProps) {
  const weekDates = getWeekDates(anchorDate)

  return (
    <View className="grid grid-cols-7 gap-1">
      {weekDates.map((date, i) => {
        const completion = completionMap.get(date) ?? { morning: false, evening: false }
        const isToday = date === todayStr
        const isSelected = date === selectedDate
        const isFuture = date > todayStr
        const weekdayChar = WEEKDAY_CHAR[i]
        const dayNum = getDayNumber(date)

        const handleClick = () => {
          if (isFuture)
            return
          onSelectDate(date)
        }

        return (
          <View
            key={date}
            role="button"
            aria-pressed={isSelected}
            aria-disabled={isFuture}
            aria-label={`${date}${isToday ? ' 今天' : ''}`}
            className={cn(
              'flex flex-col items-center gap-1.5 py-1',
              isFuture && 'pointer-events-none',
            )}
            onClick={handleClick}
          >
            <Text
              className={cn(
                'text-label-xs font-body',
                isFuture ? 'text-content-disabled' : 'text-content-tertiary',
              )}
            >
              {weekdayChar}
            </Text>

            <View
              className={cn(
                'size-6 rounded-full flex items-center justify-center',
                isToday ? 'bg-primary' : '',
              )}
            >
              <Text
                className={cn(
                  'text-label-xs tabular-nums',
                  isToday
                    ? 'text-surface-white font-body font-semibold'
                    : isSelected
                      ? 'text-primary font-body font-semibold'
                      : isFuture
                        ? 'text-content-disabled font-body'
                        : 'text-content font-body',
                )}
              >
                {dayNum}
              </Text>
            </View>

            <RingPair
              morning={completion.morning}
              evening={completion.evening}
              size={40}
              variant={isFuture ? 'skeleton' : 'filled'}
              className={isSelected ? 'ring-2 ring-primary/60 ring-offset-1' : ''}
            />
          </View>
        )
      })}
    </View>
  )
}
