import { useMemoizedFn } from 'ahooks'
import { useBrushSessionEffects } from './useBrushSessionEffects'
import { useBrushSessionState } from './useBrushSessionState'

export function useBrushSession() {
  const {
    session,
    streak,
    milestone,
    completionMessage,
    dailyStatus,
    stepPrompt,
    interactionAction,
    interactionVersion,
    startFlow,
    pauseOrResume,
    skipCurrentStep,
    resetFlow,
    tickFlow,
    syncOverview,
    applyCompletionMeta,
    markInteraction,
  } = useBrushSessionState()

  useBrushSessionEffects({
    session,
    tickFlow,
    syncOverview,
    applyCompletionMeta,
    interactionAction,
    interactionVersion,
  })

  const handleStart = useMemoizedFn(() => {
    markInteraction('start')
    startFlow()
  })

  const handlePause = useMemoizedFn(() => {
    markInteraction('pauseToggle')
    pauseOrResume()
  })

  const handleSkip = useMemoizedFn(() => {
    markInteraction('skip')
    skipCurrentStep()
  })

  return {
    session,
    streak,
    milestone,
    completionMessage,
    dailyStatus,
    stepPrompt,
    handleStart,
    handlePause,
    handleSkip,
    handleReset: resetFlow,
  }
}
