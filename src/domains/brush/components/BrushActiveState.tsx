import { View, Text } from '@tarojs/components'
import BrushTimer from '../../../components/BrushTimer'
import ErrorBoundary from '../../../components/ErrorBoundary'
import StepIndicator from '../../../components/StepIndicator'
import ToothScene from '../../../components/ToothScene'
import ShadButton from '../../../components/ui/ShadButton'
import type { BrushingSession } from '../../../services/brushing'

interface BrushActiveStateProps {
  session: BrushingSession
  stepPrompt: string
  onPause: () => void
  onSkip: () => void
}

export default function BrushActiveState({ session, stepPrompt, onPause, onSkip }: BrushActiveStateProps) {
  return (
    <View className="h-full min-h-0 pt-1 flex flex-col gap-2 overflow-hidden">
      <View className="h-[42%] min-h-[210px] overflow-hidden">
        <View className="px-1 py-1">
          <ErrorBoundary>
            <ToothScene
              currentStepIndex={session.currentStepIndex}
              isActive={session.state === 'brushing'}
              compact
              showStepName={false}
            />
          </ErrorBoundary>
        </View>
      </View>

      <View className="flex-1 min-h-0 overflow-hidden px-1 pt-1">
        <View className="h-full min-h-0 flex flex-col items-center gap-1.5 animate-slide-up motion-reduce:animate-none">
          <BrushTimer seconds={session.stepTimeLeft} stepDuration={session.stepDuration} />
          <View className="w-full rounded-2xl border border-primary/25 bg-primary-light/55 px-4 py-2.5">
            <Text className="text-base font-medium text-content leading-relaxed">{stepPrompt}</Text>
          </View>
          <StepIndicator currentStep={session.currentStepIndex} />
          <View className="w-full flex gap-2 pt-1">
            <ShadButton variant="secondary" className="min-h-10 text-base flex-1" onClick={onPause}>
              {session.state === 'paused' ? '继续' : '暂停'}
            </ShadButton>
            <ShadButton variant="secondary" className="min-h-10 text-base flex-1" onClick={onSkip}>
              跳过此步
            </ShadButton>
          </View>
        </View>
      </View>
    </View>
  )
}
