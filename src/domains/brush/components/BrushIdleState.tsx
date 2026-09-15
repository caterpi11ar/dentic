import type { DailyStatus } from '@/domains/brush/utils'
import { Image, Text, View } from '@tarojs/components'
import iconMoon from '@/assets/icons/moon.svg'
import iconSun from '@/assets/icons/sun.svg'
import Progress from '@/components/ui/Progress'
import StatRow from '@/components/ui/StatRow'

function formatTime(timestamp?: number): string {
  if (typeof timestamp !== 'number')
    return '--:--'
  const d = new Date(timestamp)
  if (Number.isNaN(d.getTime()))
    return '--:--'
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

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
    <View className="flex-1 flex flex-col">
      {/* ── 日期 ── */}
      <View className="pt-4 animate-fade-up motion-reduce:animate-none">
        <View className="flex items-baseline gap-3">
          <Text className="text-label-sm font-body font-semibold uppercase text-content-secondary">
            {todayHeading}
          </Text>
        </View>

        <Text className="block mt-4 text-display-lg font-heading font-medium tracking-tight text-content animate-fade-up-delay-1 motion-reduce:animate-none">
          {greeting}
        </Text>
      </View>

      {/* ── 模块 A：今日状态 ── */}
      <View className="mt-5 flex gap-3 animate-fade-up-delay-2 motion-reduce:animate-none">
        {/* 早刷状态卡片 */}
        <View className="flex-1 rounded-anthropic border border-line bg-surface-white/80 px-3.5 py-3">
          <View className="flex items-center gap-2">
            <Image src={iconSun} className="size-4" mode="aspectFit" />
            <Text className="text-paragraph-sm font-body font-semibold text-content">
              晨间
            </Text>
          </View>
          {dailyStatus.morningDone ? (
            <View className="mt-1.5 flex items-center gap-1.5">
              <Text className="text-display-sm font-heading font-medium text-success tabular-nums">
                {formatTime(dailyStatus.morningTime)}
              </Text>
              <Text className="text-label-xs text-success">✓</Text>
            </View>
          ) : (
            <Text className="mt-1.5 text-paragraph-sm font-body font-medium text-content-disabled">
              待完成
            </Text>
          )}
        </View>

        {/* 晚刷状态卡片 */}
        <View className="flex-1 rounded-anthropic border border-line bg-surface-white/80 px-3.5 py-3">
          <View className="flex items-center gap-2">
            <Image src={iconMoon} className="size-4" mode="aspectFit" />
            <Text className="text-paragraph-sm font-body font-semibold text-content">
              夜间
            </Text>
          </View>
          {dailyStatus.eveningDone ? (
            <View className="mt-1.5 flex items-center gap-1.5">
              <Text className="text-display-sm font-heading font-medium text-success tabular-nums">
                {formatTime(dailyStatus.eveningTime)}
              </Text>
              <Text className="text-label-xs text-success">✓</Text>
            </View>
          ) : (
            <Text className="mt-1.5 text-paragraph-sm font-body font-medium text-content-disabled">
              待完成
            </Text>
          )}
        </View>
      </View>

      {/* ── 分割线 ── */}
      <View className="my-5 h-px bg-line" />

      {/* ── 模块 C：连续打卡 ── */}
      <View className="animate-fade-up-delay-3 motion-reduce:animate-none">
        <StatRow label="连续" value={streak} unit="天" tone="primary" align="baseline" />

        <Progress
          value={milestoneProgress}
          max={100}
          label={`下一个目标 连续 ${nextMilestone} 天`}
          className="mt-3"
        />
      </View>

      {/* ── 模块 D：开始按钮 ── */}
      <View className="mt-auto pt-4 pb-20 flex justify-center">
        <View
          className="relative flex items-center justify-center"
          role="button"
          onClick={onStart}
          aria-label="开始刷牙"
        >
          {/* 波纹扩散 */}
          <View className="absolute size-20 rounded-full bg-primary/30 animate-ripple motion-reduce:animate-none" />
          <View className="absolute size-20 rounded-full bg-primary/25 animate-ripple motion-reduce:animate-none" style={{ animationDelay: '0.7s' }} />
          <View className="absolute size-20 rounded-full bg-primary/20 animate-ripple motion-reduce:animate-none" style={{ animationDelay: '1.4s' }} />
          {/* 实心按钮 */}
          <View className="relative size-20 rounded-full bg-primary flex flex-col items-center justify-center active:scale-[0.95] transition-transform">
            <Text className="text-paragraph-md font-body font-semibold text-surface-white">刷牙</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
