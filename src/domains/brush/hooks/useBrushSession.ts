import { useMemoizedFn } from 'ahooks'
import { useBrushSessionEffects } from '@/domains/brush/hooks/useBrushSessionEffects'
import { useBrushSessionState } from '@/domains/brush/hooks/useBrushSessionState'

export function useBrushSession() {
  const {
    session,
    streak,
    newlyUnlockedIds,
    completionMessage,
    dailyTip,
    dailyStatus,
    stepPrompt,
    interactionAction,
    interactionVersion,
    pausedOnceRef,
    startFlow,
    pauseOrResume,
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
    pausedOnceRef,
  })

  const handleStart = useMemoizedFn(() => {
    markInteraction('start')
    startFlow()
  })

  const handlePause = useMemoizedFn(() => {
    markInteraction('pauseToggle')
    pauseOrResume()
  })

  return {
    session,
    streak,
    newlyUnlockedIds,
    completionMessage,
    dailyTip,
    dailyStatus,
    stepPrompt,
    handleStart,
    handlePause,
    handleReset: resetFlow,
  }
}
