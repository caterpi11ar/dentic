import { View, Text } from '@tarojs/components'
import { BRUSHING_STEPS, TOTAL_STEPS } from '../../constants/brushing-steps'
import styles from './index.module.scss'

interface Props {
  currentStep: number
  totalSteps?: number
}

export default function StepIndicator({ currentStep, totalSteps = TOTAL_STEPS }: Props) {
  const stepName = BRUSHING_STEPS[currentStep]?.name ?? ''

  return (
    <View className={styles.container}>
      <View className={styles.dotsRow}>
        {Array.from({ length: totalSteps }, (_, i) => {
          let cls = styles.dot
          if (i < currentStep) cls += ` ${styles.dotDone}`
          else if (i === currentStep) cls += ` ${styles.dotActive}`
          return <View key={i} className={cls} />
        })}
      </View>
      <View className={styles.infoRow}>
        <Text className={styles.info}>
          {currentStep + 1} / {totalSteps}
        </Text>
        <Text className={styles.zoneName}>{stepName}</Text>
      </View>
    </View>
  )
}
