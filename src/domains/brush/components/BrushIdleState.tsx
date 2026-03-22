import { View, Text } from '@tarojs/components'
import ShadButton from '../../../components/ui/ShadButton'
import type { DailyStatus } from '../utils'

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
                <View className="w-full h-1.5 bg-line rounded-full mt-2 overflow-hidden">
                  <View className="h-full bg-primary rounded-full" style={{ width: `${milestoneProgress}%` }} />
                </View>
              </View>
            </View>
          </View>
        </View>
        <View className="absolute -right-10 -top-10 w-36 h-36 bg-primary/20 rounded-full blur-3xl" />
      </View>

      <View className="mt-auto pb-8 flex flex-col items-center justify-center gap-3">
        <View className="relative w-full max-w-[360px]">
          <View className={`absolute -inset-2 rounded-[999px] blur-xl ${isNight ? 'bg-primary/20' : 'bg-primary/30'}`} />
          <View
            className={`relative min-h-14 px-6 py-3.5 rounded-[999px] border-2 active:scale-95 flex items-center justify-center ${
              isNight
                ? 'border-primary/45 bg-gradient-to-br from-primary-light via-primary-light/80 to-primary/35 shadow-card-lg'
                : 'border-[#89d9a8] bg-gradient-to-br from-[#dcf7e5] via-[#b7edca] to-[#94e2b3] shadow-xl shadow-[#198f53]/30'
            }`}
            onClick={onStart}
          >
            <View className="flex items-center gap-3">
              <Text className={`text-2xl ${isNight ? 'text-primary' : 'text-[#0a7f45]'}`}>🪥</Text>
              <Text className={`text-xl font-bold ${isNight ? 'text-primary' : 'text-[#005f2d]'}`}>开始刷牙</Text>
            </View>
          </View>
        </View>
        <ShadButton
          variant="outline"
          fullWidth={false}
          className="min-h-10 px-6 text-sm"
          openType="share"
          aria-label="转发小程序给好友"
        >
          转发给朋友
        </ShadButton>
      </View>
    </View>
  )
}
