import type { DailyStatus } from '@/domains/brush/utils'
import type { BrushingSession } from '@/services/brushing'
import { useMemoizedFn } from 'ahooks'
import { useMemo, useState } from 'react'
import { getRandomCompletionMessage, MILESTONE_MESSAGES, MILESTONES } from '@/constants/brushing-steps'
import {

  createSession,
  getCurrentStep,
  pauseSession,
  resumeSession,
  startCountdown,
  tick,
  tickCountdown,
} from '@/services/brushing'

export type BrushInteractionAction = 'start' | 'pauseToggle'

interface UseBrushSessionStateResult {
  session: BrushingSession
  streak: number
  milestone: string | null
  completionMessage: string
  dailyStatus: DailyStatus
  stepPrompt: string
  interactionAction: BrushInteractionAction | null
  interactionVersion: number
  startFlow: () => void
  pauseOrResume: () => void
  resetFlow: () => void
  tickFlow: () => void
  syncOverview: (nextStreak: number, nextStatus: DailyStatus) => void
  applyCompletionMeta: (nextStreak: number) => void
  markInteraction: (action: BrushInteractionAction) => void
}

export function useBrushSessionState(): UseBrushSessionStateResult {
  const [session, setSession] = useState<BrushingSession>(createSession)
  const [streak, setStreak] = useState(0)
  const [milestone, setMilestone] = useState<string | null>(null)
  const [completionMessage, setCompletionMessage] = useState('')
  const [dailyStatus, setDailyStatus] = useState<DailyStatus>({ morningDone: false, eveningDone: false })
  const [interactionAction, setInteractionAction] = useState<BrushInteractionAction | null>(null)
  const [interactionVersion, setInteractionVersion] = useState(0)

  const startFlow = useMemoizedFn(() => {
    setSession(startCountdown(createSession()))
  })

  const pauseOrResume = useMemoizedFn(() => {
    setSession((prev) => {
      if (prev.state === 'brushing') {
        return pauseSession(prev)
      }
      if (prev.state === 'paused') {
        return resumeSession(prev)
      }
      return prev
    })
  })

  const resetFlow = useMemoizedFn(() => {
    setSession(createSession())
    setMilestone(null)
  })

  const tickFlow = useMemoizedFn(() => {
    setSession((prev) => {
      if (prev.state === 'countdown') {
        return tickCountdown(prev)
      }
      return tick(prev)
    })
  })

  const syncOverview = useMemoizedFn((nextStreak: number, nextStatus: DailyStatus) => {
    setStreak(nextStreak)
    setDailyStatus(nextStatus)
  })

  const applyCompletionMeta = useMemoizedFn((nextStreak: number) => {
    setCompletionMessage(getRandomCompletionMessage())
    const currentMilestone = MILESTONES.find(m => m === nextStreak)
    setMilestone(currentMilestone ? MILESTONE_MESSAGES[currentMilestone] : null)
  })

  const markInteraction = useMemoizedFn((action: BrushInteractionAction) => {
    setInteractionAction(action)
    setInteractionVersion(prev => prev + 1)
  })

  const stepPrompt = useMemo(() => getCurrentStep(session).prompt, [session])

  return {
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
    resetFlow,
    tickFlow,
    syncOverview,
    applyCompletionMeta,
    markInteraction,
  }
}
