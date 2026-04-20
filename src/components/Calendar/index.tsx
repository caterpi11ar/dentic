import { Image, Text, View } from '@tarojs/components'
import iconChevLeft from '@/assets/icons/icon-chevron-left.svg'
import iconChevRight from '@/assets/icons/icon-chevron-right.svg'
import RingPair from '@/components/RingPair'
import Badge from '@/components/ui/Badge'
import { cn } from '@/components/ui/cn'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const CELL_HEIGHT = 78
const RING_SIZE = 40

interface DaySessionInfo {
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
  isFuture: boolean
  sessionInfo?: DaySessionInfo
  onSelectDate: (date: string) => void
}

function formatMonth(year: number, month: number): string {
  return `${year}年${month}月`
}

function CalendarDayButton({
  day,
  month,
  dateStr,
  isToday,
  isSelected,
  isFuture,
  sessionInfo,
  onSelectDate,
}: CalendarDayButtonProps) {
  const isBrushed = !!sessionInfo

  const handleActivate = () => {
    if (isFuture)
      return
    onSelectDate(dateStr)
  }

  const ariaLabel = `${month}月${day}日${
    isToday ? '，今天' : ''
  }${
    isBrushed ? '，已刷牙' : ''
  }${
    isFuture ? '，未来' : ''
  }`

  return (
    <View
      className={cn(
        'flex flex-col items-center gap-1.5 py-1',
        isFuture && 'pointer-events-none',
      )}
      style={{ height: `${CELL_HEIGHT}px` }}
      role="button"
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      aria-disabled={isFuture}
      onClick={handleActivate}
    >
      <View
        className={cn(
          'size-6 rounded-full flex items-center justify-center',
          isToday ? 'bg-primary' : '',
        )}
      >
        <Text
          className={cn(
            'text-label-xs tabular-nums font-body',
            isToday
              ? 'text-surface-white font-semibold'
              : isSelected
                ? 'text-primary font-semibold'
                : isFuture
                  ? 'text-content-disabled'
                  : 'text-content',
          )}
        >
          {day}
        </Text>
      </View>

      <RingPair
        morning={sessionInfo?.morning ?? false}
        evening={sessionInfo?.evening ?? false}
        size={RING_SIZE}
        variant={isFuture ? 'skeleton' : 'filled'}
        className={isSelected ? 'ring-2 ring-primary/60 ring-offset-1' : ''}
      />
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
    <View className="rounded-anthropic-lg bg-surface-white border border-line overflow-hidden">
      {/* 头部 */}
      {!hideHeader && (
        <View className="px-5 pt-4 pb-2 border-b border-line">
          <View className="flex items-center justify-between">
            <Text className="text-paragraph-md font-heading font-medium text-content">
              {formatMonth(year, month)}
            </Text>
            <View className="flex items-center gap-2">
              <View
                role="button"
                aria-label="上个月"
                className="size-8 min-h-8 min-w-8 rounded-full border border-content/[0.28] bg-surface-white flex items-center justify-center active:bg-line-light"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.55)' }}
                onClick={onPrevMonth}
              >
                <Image src={iconChevLeft} className="size-4" mode="aspectFit" />
              </View>
              <View
                role="button"
                aria-label="下个月"
                className="size-8 min-h-8 min-w-8 rounded-full border border-content/[0.28] bg-surface-white flex items-center justify-center active:bg-line-light"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.55)' }}
                onClick={onNextMonth}
              >
                <Image src={iconChevRight} className="size-4" mode="aspectFit" />
              </View>
            </View>
          </View>

          {!hideStats && (
            <View className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="default">
                本月
                {monthBrushed}
              </Badge>
              <Badge variant="secondary">
                连续
                {streak}
              </Badge>
              <Badge variant="secondary">
                累计
                {totalDays}
              </Badge>
            </View>
          )}
        </View>
      )}

      {/* 日历体 */}
      <View className={cn('px-2', hideHeader ? 'pt-3' : 'pt-1', 'pb-2')}>
        {/* 星期头 */}
        <View className="grid grid-cols-7 mb-0.5">
          {WEEKDAYS.map(weekday => (
            <View key={weekday} className="flex items-center justify-center py-1">
              <Text className="text-label-xs font-body font-semibold text-content-tertiary">
                {weekday}
              </Text>
            </View>
          ))}
        </View>

        {/* 日期网格 */}
        <View className="grid grid-cols-7">
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <View key={`empty-${i}`} style={{ height: `${CELL_HEIGHT}px` }} />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const sessionInfo = daySessionMap.get(dateStr)
            const isToday = dateStr === todayStr
            const isSelected = dateStr === selectedDate
            const isFuture = dateStr > todayStr

            return (
              <CalendarDayButton
                key={dateStr}
                day={day}
                month={month}
                dateStr={dateStr}
                sessionInfo={sessionInfo}
                isToday={isToday}
                isSelected={isSelected}
                isFuture={isFuture}
                onSelectDate={onSelectDate}
              />
            )
          })}
        </View>
      </View>
    </View>
  )
}
