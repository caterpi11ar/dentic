import { View, Text } from '@tarojs/components'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { TOTAL_STEPS } from '@/constants/brushing-steps'

interface BrushCompletedStateProps {
  completionMessage: string
  milestone: string | null
  elapsedTime: number
  streak: number
  onReset: () => void
}

export default function BrushCompletedState({
  completionMessage,
  milestone,
  elapsedTime,
  streak,
  onReset,
}: BrushCompletedStateProps) {
  return (
    <View className="pt-2">
      <Card className="w-full rounded-3xl bg-surface-white/95 p-5 shadow-card-lg animate-fade-scale-in motion-reduce:animate-none">
        <View className="flex flex-col items-center text-center">
          <View className="size-16 rounded-full bg-gradient-to-br from-success to-success-dark flex items-center justify-center mb-4 animate-bounce-slow motion-reduce:animate-none">
            <Text className="text-5xl text-surface-white">✓</Text>
          </View>
          <Text className="text-xl md:text-2xl leading-snug font-bold text-content max-w-[90%]">{completionMessage}</Text>
          {milestone && (
            <Text className="text-sm md:text-base leading-relaxed text-warning font-bold mt-2 max-w-[90%]">{milestone}</Text>
          )}
        </View>

        <View className="mt-4 flex flex-col gap-1.5">
          <View className="rounded-lg bg-surface border border-line-light px-3 py-2.5 min-h-10 flex items-center justify-between">
            <Text className="text-sm text-content-secondary">总用时</Text>
            <Text className="text-base font-bold text-primary tabular-nums">
              {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
            </Text>
          </View>
          <View className="rounded-lg bg-surface border border-line-light px-3 py-2.5 min-h-10 flex items-center justify-between">
            <Text className="text-sm text-content-secondary">步骤数</Text>
            <Text className="text-base font-bold text-success tabular-nums">{TOTAL_STEPS}</Text>
          </View>
          <View className="rounded-lg bg-surface border border-line-light px-3 py-2.5 min-h-10 flex items-center justify-between">
            <Text className="text-sm text-content-secondary">连续天数</Text>
            <Text className="text-base font-bold text-warning tabular-nums">{streak}</Text>
          </View>
        </View>

        <View className="mt-4 flex flex-col gap-2">
          <Button className="min-h-11 text-base" openType="share" aria-label="分享刷牙成绩">
            分享
          </Button>
          <Button variant="secondary" className="min-h-11 text-base" onClick={onReset} aria-label="返回首页">
            返回
          </Button>
        </View>
      </Card>
    </View>
  )
}
