import { Image, Text, View } from '@tarojs/components'
import iconChevLeft from '@/assets/icons/icon-chevron-left.svg'
import iconChevRight from '@/assets/icons/icon-chevron-right.svg'
import Badge from '@/components/ui/Badge'
import { cn } from '@/components/ui/cn'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

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
  sessionInfo,
  onSelectDate,
}: CalendarDayButtonProps) {
  const isBrushed = !!sessionInfo
  const handleActivate = () => onSelectDate(dateStr)

  return (
    <View
      className="flex flex-col items-center justify-center"
      style={{ height: '44px' }}
      role="button"
      aria-label={`${month}月${day}日${isBrushed ? '，已刷牙' : ''}`}
      aria-pressed={isSelected}
      onClick={handleActivate}
    >
      {/* 日期圆 */}
      <View
        className={cn(
          'size-9 rounded-full flex items-center justify-center relative',
          isSelected
            ? 'bg-primary'
            : isToday
              ? 'bg-primary/15'
              : isBrushed
                ? 'bg-content/[0.05]'
                : '',
        )}
      >
        <Text
          className={cn(
            'text-paragraph-sm tabular-nums',
            isSelected
              ? 'text-surface-white font-body font-semibold'
              : isToday
                ? 'text-primary font-heading font-medium'
                : isBrushed
                  ? 'text-content font-body font-medium'
                  : 'text-content-disabled font-body',
          )}
        >
          {day}
        </Text>

        {/* 今天指示环 */}
        {isToday && !isSelected && (
          <View className="absolute inset-0 rounded-full border-2 border-primary/40" />
        )}
      </View>

      {/* 刷牙指示 */}
      <View className="flex items-center justify-center gap-1" style={{ height: '6px' }}>
        {sessionInfo?.morning && <View className="size-2 rounded-full bg-surface-white border border-content/20" />}
        {sessionInfo?.evening && <View className="size-2 rounded-full bg-content" />}
      </View>
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
      <View className={cn('px-2', hideHeader ? 'pt-3' : 'pt-1', 'pb-1')}>
        {/* 星期头 */}
        <View className="grid grid-cols-7 mb-0.5">
          {WEEKDAYS.map(weekday => (
            <View key={weekday} className="flex items-center justify-center py-1">
              <Text className="text-label-xs font-body font-semibold text-content-tertiary tracking-widest">
                {weekday}
              </Text>
            </View>
          ))}
        </View>

        {/* 日期网格 */}
        <View className="grid grid-cols-7">
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <View key={`empty-${i}`} style={{ height: '44px' }} />
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

        {/* 图例 */}
        <View className="flex items-center justify-center gap-4 mt-2 pt-2 border-t border-line-lighter">
          <View className="flex items-center gap-1.5">
            <View className="size-2 rounded-full bg-surface-white border border-content/20" />
            <Text className="text-label-xs text-content-tertiary">白天</Text>
          </View>
          <View className="flex items-center gap-1.5">
            <View className="size-2 rounded-full bg-content" />
            <Text className="text-label-xs text-content-tertiary">夜晚</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
