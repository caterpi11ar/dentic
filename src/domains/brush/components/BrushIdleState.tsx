import { View, Text } from '@tarojs/components'
import { cn } from '@/components/ui/cn'
import Button from '@/components/ui/Button'
import Progress from '@/components/ui/Progress'
import type { DailyStatus } from '@/domains/brush/utils'

interface BrushIdleStateProps {
  isNight: boolean
  todayHeading: string
  greeting: string
  streak: number
  dailyStatus: DailyStatus
  nextMilestone: number
  milestoneProgress: number
  onStart: () => void
}

export default function BrushIdleState({
  isNight,
  todayHeading,
  greeting,
  streak,
  dailyStatus,
  nextMilestone,
  milestoneProgress,
  onStart,
}: BrushIdleStateProps) {
  return (
    <View className="h-full flex flex-col gap-4">
      <View className="relative overflow-hidden rounded-xl bg-surface-white border border-line-light px-5 py-4">
        <View className="relative z-10">
          <Text className="text-sm tracking-[0.08em] text-primary font-bold">{todayHeading}</Text>
          <Text className="block mt-1.5 text-[34px] leading-none font-bold tracking-tight text-content">{greeting}</Text>
          <Text className="block mt-1.5 text-sm text-content-secondary">准备好继续守护你的口腔健康了吗？</Text>

          <View className="mt-4 pt-4 border-t border-line-light">
            <View className="flex justify-around items-center">
              <View
                className={`w-12 h-12 rounded-full flex items-center justify-center relative ${
                  dailyStatus.morningDone ? 'bg-primary-light/70 border border-primary/20' : 'bg-surface border border-line-light'
                }`}
              >
                <Text className="text-2xl">☀️</Text>
                <View
                  className={`absolute -bottom-1 -right-1 rounded-full h-4 w-4 flex items-center justify-center shadow-md ${
                    dailyStatus.morningDone
                      ? 'bg-primary text-surface-white'
                      : 'bg-surface border border-line text-content-disabled'
                  }`}
                >
                  <Text className="text-[10px]">{dailyStatus.morningDone ? '✓' : '○'}</Text>
                </View>
              </View>

              <View className="h-6 w-[1px] bg-line-light" />

              <View
                className={`w-12 h-12 rounded-full flex items-center justify-center relative ${
                  dailyStatus.eveningDone
                    ? 'bg-primary-light/70 border border-primary/20'
                    : 'border-2 border-dashed border-line'
                }`}
              >
                <Text className="text-2xl">🌙</Text>
                <View
                  className={`absolute -bottom-1 -right-1 rounded-full h-4 w-4 flex items-center justify-center shadow-md ${
                    dailyStatus.eveningDone
                      ? 'bg-primary text-surface-white'
                      : 'bg-surface border border-line text-content-disabled'
                  }`}
                >
                  <Text className="text-[10px]">{dailyStatus.eveningDone ? '✓' : '○'}</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="mt-3.5 pt-3.5 border-t border-line-light">
            <View className="flex items-center gap-3">
              <View className="flex-1 min-w-0">
                <View className="flex items-center gap-2">
                  <Text className="text-sm font-bold tracking-[0.08em] text-primary">当前连续</Text>
                  <Text className="text-base">🔥</Text>
                </View>
                <View className="mt-1.5 flex items-baseline gap-1">
                  <Text className="text-[40px] leading-none font-bold tracking-tighter text-primary">{streak}</Text>
                  <Text className="text-lg font-bold text-primary">天</Text>
                </View>
              </View>

              <View className="flex-1 min-w-0 rounded-xl border border-line-light bg-surface px-3 py-2.5">
                <Text className="text-sm font-semibold text-content">下个里程碑：{nextMilestone} 天</Text>
                <Progress value={milestoneProgress} max={100} className="mt-0.5" />
              </View>
            </View>
          </View>
        </View>
        <View className="absolute -right-10 -top-10 w-36 h-36 bg-primary/20 rounded-full blur-3xl" />
      </View>

      <View className="mt-auto pb-8">
        <Button
          className={cn(
            'w-full max-w-[360px] mx-auto min-h-14 rounded-[999px] text-xl font-bold',
            isNight ? 'shadow-card' : 'shadow-card-lg'
          )}
          size="lg"
          onClick={onStart}
          aria-label="开始刷牙"
        >
          <Text className="text-2xl text-surface">🪥</Text>
          <Text className="text-xl font-bold text-surface">开始刷牙</Text>
        </Button>
      </View>
    </View>
  )
}
