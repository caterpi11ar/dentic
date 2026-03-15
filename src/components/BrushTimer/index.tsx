import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface Props {
  seconds: number
  stepDuration: number
  prompt: string
  stepName: string
}

export default function BrushTimer({ seconds, stepDuration, prompt, stepName }: Props) {
  const progress = (stepDuration - seconds) / stepDuration
  const deg = Math.round(progress * 360)

  return (
    <View className={styles.timer}>
      <View
        className={styles.ring}
        style={{
          background: `conic-gradient(#4FC3F7 ${deg}deg, #e8e8e8 ${deg}deg)`,
        }}
      >
        <View className={styles.ringInner}>
          <Text className={styles.seconds}>{seconds}</Text>
        </View>
      </View>
      <Text className={styles.label}>{stepName}</Text>
      <Text className={styles.prompt}>{prompt}</Text>
    </View>
  )
}
