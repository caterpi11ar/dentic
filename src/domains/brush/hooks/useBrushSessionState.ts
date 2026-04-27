import type { DailyTip } from '@/constants/daily-tips'
import type { DailyStatus } from '@/domains/brush/utils'
import type { BrushingSession } from '@/services/brushing'
import { useMemoizedFn } from 'ahooks'
import { useMemo, useRef, useState } from 'react'
import { getRandomCompletionMessage } from '@/constants/brushing-steps'
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
  newlyUnlockedIds: string[]
  completionMessage: string
  dailyTip: DailyTip | null
  dailyStatus: DailyStatus
  stepPrompt: string
  interactionAction: BrushInteractionAction | null
  interactionVersion: number
  /** 本次会话是否暂停过（refs.current 可由 effects 在完成时读取） */
  pausedOnceRef: { readonly current: boolean }
  startFlow: () => void
  pauseOrResume: () => void
  resetFlow: () => void
  tickFlow: () => void
  syncOverview: (nextStreak: number, nextStatus: DailyStatus) => void
  applyCompletionMeta: (nextStreak: number, tip: DailyTip | null, newlyUnlockedIds: string[]) => void
  markInteraction: (action: BrushInteractionAction) => void
}

export function useBrushSessionState(): UseBrushSessionStateResult {
  const [session, setSession] = useState<BrushingSession>(createSession)
  const [streak, setStreak] = useState(0)
  const [newlyUnlockedIds, setNewlyUnlockedIds] = useState<string[]>([])
  const [completionMessage, setCompletionMessage] = useState('')
  const [dailyTip, setDailyTip] = useState<DailyTip | null>(null)
  const [dailyStatus, setDailyStatus] = useState<DailyStatus>({ morningDone: false, eveningDone: false })
  const [interactionAction, setInteractionAction] = useState<BrushInteractionAction | null>(null)
  const [interactionVersion, setInteractionVersion] = useState(0)
  const pausedOnceRef = useRef(false)

  const startFlow = useMemoizedFn(() => {
    pausedOnceRef.current = false
    setSession(startCountdown(createSession()))
  })

  const pauseOrResume = useMemoizedFn(() => {
    setSession((prev) => {
      if (prev.state === 'brushing') {
        pausedOnceRef.current = true
        return pauseSession(prev)
      }
      if (prev.state === 'paused') {
        return resumeSession(prev)
      }
      return prev
    })
  })

  const resetFlow = useMemoizedFn(() => {
    pausedOnceRef.current = false
    setSession(createSession())
    setNewlyUnlockedIds([])
    setDailyTip(null)
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

  const applyCompletionMeta = useMemoizedFn((nextStreak: number, tip: DailyTip | null, newlyIds: string[]) => {
    setCompletionMessage(getRandomCompletionMessage())
    setDailyTip(tip)
    setNewlyUnlockedIds(newlyIds)
  })

  const markInteraction = useMemoizedFn((action: BrushInteractionAction) => {
    setInteractionAction(action)
    setInteractionVersion(prev => prev + 1)
  })

  const stepPrompt = useMemo(() => getCurrentStep(session).prompt, [session])

  return {
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
  }
}
