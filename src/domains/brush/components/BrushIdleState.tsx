import { View, Text, Image } from '@tarojs/components'
import Progress from '@/components/ui/Progress'
import { useWeather } from '@/hooks/useWeather'
import type { DailyStatus } from '@/domains/brush/utils'
import iconSun from '@/assets/icons/sun.svg'
import iconMoon from '@/assets/icons/moon.svg'

function formatTime(timestamp?: number): string {
  if (typeof timestamp !== 'number') return '--:--'
  const d = new Date(timestamp)
  if (Number.isNaN(d.getTime())) return '--:--'
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
  const { weather } = useWeather()

  return (
    <View className="h-full flex flex-col">
      {/* ── Hero ── */}
      <View className="pt-4 animate-fade-up motion-reduce:animate-none">
        <View className="flex items-baseline gap-3">
          <Text className="text-paragraph-sm font-body font-semibold tracking-[0.12em] uppercase text-content-secondary">
            {todayHeading}
          </Text>
          {weather && (
            <Text className="text-paragraph-sm font-body font-semibold text-content-secondary">
              {weather.temp}° {weather.description}
            </Text>
          )}
        </View>

        <Text className="block mt-6 text-display-lg font-heading font-medium tracking-tight text-content animate-fade-up-delay-1 motion-reduce:animate-none">
          {greeting}
        </Text>

        <Text className="block mt-4 text-paragraph-md font-heading leading-relaxed text-content-tertiary animate-fade-up-delay-2 motion-reduce:animate-none">
          准备好继续守护你的口腔健康了吗？
        </Text>
      </View>

      {/* ── Divider ── */}
      <View className="my-10 h-px bg-line" />

      {/* ── Daily status ── */}
      <View className="flex flex-col gap-3 animate-fade-up-delay-2 motion-reduce:animate-none">
        <View className="flex items-center justify-between">
          <View className="flex items-center gap-2">
            <Image src={iconSun} className="size-4" mode="aspectFit" />
            <Text className="text-paragraph-sm font-body font-semibold tracking-wide text-content">
              晨间
            </Text>
          </View>
          {dailyStatus.morningDone ? (
            <Text className="text-paragraph-sm font-body font-semibold text-success tabular-nums">
              {formatTime(dailyStatus.morningTime)}
            </Text>
          ) : (
            <Text className="text-paragraph-sm font-body font-medium text-content-disabled">待完成</Text>
          )}
        </View>

        <View className="flex items-center justify-between">
          <View className="flex items-center gap-2">
            <Image src={iconMoon} className="size-4" mode="aspectFit" />
            <Text className="text-paragraph-sm font-body font-semibold tracking-wide text-content">
              夜间
            </Text>
          </View>
          {dailyStatus.eveningDone ? (
            <Text className="text-paragraph-sm font-body font-semibold text-success tabular-nums">
              {formatTime(dailyStatus.eveningTime)}
            </Text>
          ) : (
            <Text className="text-paragraph-sm font-body font-medium text-content-disabled">待完成</Text>
          )}
        </View>
      </View>

      {/* ── Divider ── */}
      <View className="my-10 h-px bg-line" />

      {/* ── Streak + Milestone ── */}
      <View className="animate-fade-up-delay-3 motion-reduce:animate-none">
        <View className="flex items-baseline gap-2">
          <Text className="text-label-sm font-body font-semibold tracking-wide text-content-tertiary uppercase">
            连续
          </Text>
          <Text className="text-display-md leading-none font-heading font-medium tabular-nums text-primary">
            {streak}
          </Text>
          <Text className="text-label-sm font-body font-semibold tracking-wide text-content-tertiary uppercase">
            天
          </Text>
        </View>

        <Progress
          value={milestoneProgress}
          max={100}
          label={`下一个目标 连续 ${nextMilestone} 天`}
          className="mt-4"
          trackClassName="h-2 bg-line"
        />
      </View>

      {/* ── CTA ── */}
      <View className="mt-auto pb-10 flex justify-center">
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
