import type { BrushingSession } from '@/services/brushing'
import { Image, Text, View } from '@tarojs/components'
import iconBrushPlay from '@/assets/icons/brush-play.svg'
import iconBrushStop from '@/assets/icons/brush-stop.svg'
import BrushTimer from '@/components/BrushTimer'
import ErrorBoundary from '@/components/ErrorBoundary'
import StepIndicator from '@/components/StepIndicator'
import ToothScene from '@/components/ToothScene'

interface BrushActiveStateProps {
  session: BrushingSession
  stepPrompt: string
  onPause: () => void
}

export default function BrushActiveState({ session, stepPrompt, onPause }: BrushActiveStateProps) {
  const toothSceneMode
    = session.state === 'brushing' ? 'brushing' : session.state === 'paused' ? 'paused' : 'inactive'
  const isPaused = session.state === 'paused'

  return (
    <View className="h-full min-h-0 pt-3 flex flex-col gap-3 overflow-hidden">
      <View className={`h-[42%] min-h-[210px] overflow-visible rounded-anthropic-lg bg-content/[0.06]${isPaused ? ' opacity-60' : ''}`}>
        <View className="px-1 py-1">
          <ErrorBoundary>
            <ToothScene
              currentStepIndex={session.currentStepIndex}
              isActive={session.state === 'brushing'}
              compact
              showStepName={false}
              mode={toothSceneMode}
            />
          </ErrorBoundary>
        </View>
      </View>

      <View className="flex-1 min-h-0 overflow-hidden px-1 pt-1">
        <View className="h-full min-h-0 flex flex-col items-center gap-2.5 animate-slide-up motion-reduce:animate-none">
          <BrushTimer seconds={session.stepTimeLeft} stepDuration={session.stepDuration} />
          <View className="w-full rounded-anthropic border border-line bg-primary-light px-4 py-3.5">
            <Text className="text-paragraph-md font-medium text-content leading-relaxed">{stepPrompt}</Text>
          </View>
          <StepIndicator currentStep={session.currentStepIndex} />
          <View className="w-full pt-2 flex justify-center">
            <View
              role="button"
              hoverClass="none"
              className="size-12 rounded-full bg-surface-white/95 shadow-card flex items-center justify-center active:scale-[0.96] transition-transform"
              onClick={onPause}
              aria-label={isPaused ? '继续刷牙' : '暂停刷牙'}
            >
              <Image src={isPaused ? iconBrushPlay : iconBrushStop} className="size-9" mode="aspectFit" />
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}
