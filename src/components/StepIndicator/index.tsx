import { View, Text } from '@tarojs/components'
import { TOTAL_STEPS } from '../../constants/brushing-steps'
import styles from './index.module.scss'

interface Props {
  currentStep: number
  totalSteps?: number
}

export default function StepIndicator({ currentStep, totalSteps = TOTAL_STEPS }: Props) {
  return (
    <View className={styles.container}>
      {Array.from({ length: totalSteps }, (_, i) => {
        let cls = styles.dot
        if (i < currentStep) cls += ` ${styles.dotDone}`
        else if (i === currentStep) cls += ` ${styles.dotActive}`
        return <View key={i} className={cls} />
      })}
      <Text className={styles.info}>{currentStep + 1} / {totalSteps}</Text>
    </View>
  )
}
