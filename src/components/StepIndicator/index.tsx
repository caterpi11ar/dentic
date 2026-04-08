import { View, Text } from '@tarojs/components'
import { BRUSHING_STEPS, TOTAL_STEPS } from '@/constants/brushing-steps'
import { cn } from '@/components/ui/cn'

interface Props {
  currentStep: number
  totalSteps?: number
}

export default function StepIndicator({ currentStep, totalSteps = TOTAL_STEPS }: Props) {
  const stepName = BRUSHING_STEPS[currentStep]?.name ?? ''

  return (
    <View
      className="flex flex-col items-center py-2 gap-1.5 w-full"
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`步骤 ${currentStep + 1} 共 ${totalSteps} 步`}
    >
      {/* 分段进度条 */}
      <View className="flex items-center gap-0.5 w-full px-2">
        {Array.from({ length: totalSteps }, (_, i) => {
          const isDone = i < currentStep
          const isActive = i === currentStep
          return (
            <View
              key={i}
              className={cn(
                'h-2 flex-1 rounded-full transition-[background-color] duration-300 ease-in-out motion-reduce:transition-none',
                isDone ? 'bg-primary' : isActive ? 'bg-primary animate-gentle-pulse' : 'bg-line'
              )}
            />
          )
        })}
      </View>
      <View className="flex items-center justify-center gap-1.5">
        <Text className="text-label-sm font-body text-content-tertiary tabular-nums">
          {currentStep + 1} / {totalSteps}
        </Text>
        <Text className="text-paragraph-sm font-heading text-primary font-medium">{stepName}</Text>
      </View>
    </View>
  )
}
