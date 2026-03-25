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
      <Card className="w-full rounded-anthropic-lg bg-surface-white p-6 shadow-card border border-content/[0.06] animate-fade-scale-in motion-reduce:animate-none">
        <View className="flex flex-col items-center text-center">
          <View className="size-16 rounded-full bg-gradient-to-br from-success to-success-dark flex items-center justify-center mb-4 animate-bounce-slow motion-reduce:animate-none">
            <Text className="text-5xl text-surface-white">✓</Text>
          </View>
          <Text className="text-display-sm font-heading font-bold text-content max-w-[90%]">{completionMessage}</Text>
          {milestone && (
            <Text className="text-paragraph-sm md:text-base leading-relaxed text-info font-bold mt-2 max-w-[90%]">{milestone}</Text>
          )}
        </View>

        <View className="mt-5 flex flex-col gap-2">
          <View className="rounded-anthropic bg-content/[0.03] border border-content/[0.06] px-4 py-3 min-h-11 flex items-center justify-between">
            <Text className="text-paragraph-sm text-content/50">总用时</Text>
            <Text className="text-paragraph-md font-heading font-bold text-primary tabular-nums">
              {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
            </Text>
          </View>
          <View className="rounded-anthropic bg-content/[0.03] border border-content/[0.06] px-4 py-3 min-h-11 flex items-center justify-between">
            <Text className="text-paragraph-sm text-content/50">步骤数</Text>
            <Text className="text-paragraph-md font-heading font-bold text-success tabular-nums">{TOTAL_STEPS}</Text>
          </View>
          <View className="rounded-anthropic bg-content/[0.03] border border-content/[0.06] px-4 py-3 min-h-11 flex items-center justify-between">
            <Text className="text-paragraph-sm text-content/50">连续天数</Text>
            <Text className="text-paragraph-md font-heading font-bold text-info tabular-nums">{streak}</Text>
          </View>
        </View>

        <View className="mt-5 flex flex-col gap-2">
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
