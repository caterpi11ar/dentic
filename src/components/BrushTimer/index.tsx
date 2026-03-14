import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface Props {
  seconds: number
  stepDuration: number
  prompt: string
  stepName: string
}

export default function BrushTimer({ seconds, stepDuration, prompt, stepName }: Props) {
  const progress = ((stepDuration - seconds) / stepDuration) * 360

  return (
    <View className={styles.timer}>
      <View className={styles.ring}>
        <View className={styles.ringBg} />
        <View
          className={styles.ringProgress}
          style={{ transform: `rotate(${progress}deg)` }}
        />
        <Text className={styles.seconds}>{seconds}</Text>
      </View>
      <Text className={styles.label}>{stepName}</Text>
      <Text className={styles.prompt}>{prompt}</Text>
    </View>
  )
}
