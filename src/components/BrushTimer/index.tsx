import { Text, View } from '@tarojs/components'

interface Props {
  seconds: number
  stepDuration: number
}

export default function BrushTimer({ seconds, stepDuration }: Props) {
  const progress = (stepDuration - seconds) / stepDuration
  const deg = Math.round(progress * 360)

  return (
    <View className="flex items-center justify-center py-3" role="timer" aria-label="刷牙计时器">
      <View
        className="relative size-ring rounded-full flex items-center justify-center"
        style={{
          background: `conic-gradient(var(--color-primary) ${deg}deg, var(--color-border) ${deg}deg)`,
          transition: 'background 0.8s linear',
        }}
      >
        <View className="size-ring-inner rounded-full bg-surface-white flex items-center justify-center shadow-card">
          <Text className="text-display-lg leading-none font-heading font-bold text-content tabular-nums" aria-label={`${seconds}秒`}>
            {seconds}
          </Text>
        </View>
      </View>
    </View>
  )
}
