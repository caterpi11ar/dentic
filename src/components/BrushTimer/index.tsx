import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface Props {
  seconds: number
  stepDuration: number
  prompt: string
  stepName: string
  totalRemaining?: number
}

export default function BrushTimer({
  seconds,
  stepDuration,
  prompt,
  stepName,
  totalRemaining,
}: Props) {
  const progress = (stepDuration - seconds) / stepDuration
  const deg = Math.round(progress * 360)

  const formatRemaining = (s: number) => {
    const min = Math.floor(s / 60)
    const sec = s % 60
    return `${min}:${String(sec).padStart(2, '0')}`
  }

  return (
    <View className={styles.timer} role="timer" aria-label="刷牙计时器">
      <View
        className={styles.ring}
        style={{
          background: `conic-gradient(var(--color-primary) ${deg}deg, var(--color-border) ${deg}deg)`,
        }}
      >
        <View className={styles.ringInner}>
          <Text className={styles.seconds} aria-label={`${seconds}秒`}>{seconds}</Text>
          {totalRemaining !== undefined && (
            <Text className={styles.remaining} aria-live="polite">剩余 {formatRemaining(totalRemaining)}</Text>
          )}
        </View>
      </View>
      <Text className={styles.label}>{stepName}</Text>
      <Text className={styles.prompt}>{prompt}</Text>
    </View>
  )
}
