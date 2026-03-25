import { View, Text } from '@tarojs/components'
import { cn } from '@/components/ui/cn'
import Button from '@/components/ui/Button'
import Progress from '@/components/ui/Progress'
import type { DailyStatus } from '@/domains/brush/utils'

interface BrushIdleStateProps {
  todayHeading: string
  greeting: string
  streak: number
  dailyStatus: DailyStatus
  nextMilestone: number
  milestoneProgress: number
  onStart: () => void
}

export default function BrushIdleState({
  todayHeading,
  greeting,
  streak,
  dailyStatus,
  nextMilestone,
  milestoneProgress,
  onStart,
}: BrushIdleStateProps) {
  return (
    <View className="h-full flex flex-col">
      {/* ── Hero ── */}
      <View className="pt-2">
        <Text className="text-xs font-heading font-semibold tracking-[0.12em] uppercase text-content-tertiary">
          {todayHeading}
        </Text>

        <Text className="block mt-6 text-[52px] leading-[1.05] font-body font-medium tracking-tight text-content">
          {greeting}
        </Text>

        <Text className="block mt-3 text-base leading-relaxed text-content-secondary">
          准备好继续守护你的口腔健康了吗？
        </Text>
      </View>

      {/* ── Divider ── */}
      <View className="my-6 h-[1px] bg-line" />

      {/* ── Daily status ── */}
      <View className="flex flex-col gap-3">
        <View className="flex items-center justify-between">
          <Text className="text-sm font-heading font-semibold tracking-wide text-content">
            晨间
          </Text>
          <Text
            className={cn(
              'text-sm font-heading font-semibold',
              dailyStatus.morningDone ? 'text-primary' : 'text-content-tertiary'
            )}
          >
            {dailyStatus.morningDone ? '已完成' : '待完成'}
          </Text>
        </View>

        <View className="flex items-center justify-between">
          <Text className="text-sm font-heading font-semibold tracking-wide text-content">
            夜间
          </Text>
          <Text
            className={cn(
              'text-sm font-heading font-semibold',
              dailyStatus.eveningDone ? 'text-primary' : 'text-content-tertiary'
            )}
          >
            {dailyStatus.eveningDone ? '已完成' : '待完成'}
          </Text>
        </View>
      </View>

      {/* ── Divider ── */}
      <View className="my-6 h-[1px] bg-line" />

      {/* ── Streak + Milestone ── */}
      <View>
        <View className="flex items-baseline gap-1.5">
          <Text className="text-sm font-heading font-semibold tracking-wide text-content">
            连续
          </Text>
          <Text className="text-[28px] leading-none font-heading font-bold tabular-nums text-primary">
            {streak}
          </Text>
          <Text className="text-sm font-heading font-semibold tracking-wide text-content">
            天
          </Text>
        </View>

        <Progress
          value={milestoneProgress}
          max={100}
          label={`距离 ${nextMilestone} 天里程碑`}
          className="mt-3"
          trackClassName="h-1 bg-line-light"
        />
      </View>

      {/* ── CTA ── */}
      <View className="mt-auto pb-8">
        <Button
          className="w-full max-w-[360px] mx-auto min-h-14 rounded-[999px] text-lg font-bold shadow-card-lg"
          size="lg"
          onClick={onStart}
          aria-label="开始刷牙"
        >
          开始刷牙
        </Button>
      </View>
    </View>
  )
}
