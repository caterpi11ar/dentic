import type { BrushInteractionAction } from '@/domains/brush/hooks/useBrushSessionState'
import type { DailyStatus } from '@/domains/brush/utils'
import type { BrushingSession } from '@/services/brushing'
import Taro, { useDidShow } from '@tarojs/taro'
import { useInterval, useUnmount } from 'ahooks'
import { useEffect, useRef } from 'react'
import {
  destroyBrushAudio,
  playBrushCompleteAudio,
  playBrushStartAudio,
  playBrushStepAudio,
} from '@/domains/brush/effects/audioFeedback'
import { setBrushScreenWakeLock } from '@/domains/brush/effects/screenWakeLock'
import {
  vibrateBrushComplete,
  vibrateBrushStepChange,
  vibrateBrushTap,
} from '@/domains/brush/effects/vibrationFeedback'
import {
  getBrushOverview,
  markBrushOnboardingSeen,
  saveBrushAbandonedRecord,
  saveBrushCompletionRecord,
  shouldShowBrushOnboarding,
  syncBrushAbandonedRecordToCloud,
  syncBrushRecordToCloud,
} from '@/domains/brush/repositories/brushRepository'
import { trackEvent } from '@/services/analytics'

interface UseBrushSessionEffectsParams {
  session: BrushingSession
  tickFlow: () => void
  addPauseDuration: (seconds: number) => void
  syncOverview: (nextStreak: number, nextStatus: DailyStatus) => void
  applyCompletionMeta: (nextStreak: number) => void
  interactionAction: BrushInteractionAction | null
  interactionVersion: number
}

export function useBrushSessionEffects({
  session,
  tickFlow,
  addPauseDuration,
  syncOverview,
  applyCompletionMeta,
  interactionAction,
  interactionVersion,
}: UseBrushSessionEffectsParams): void {
  const completedHandledRef = useRef(false)
  const sessionRef = useRef(session)
  sessionRef.current = session
  const pauseStartRef = useRef(0)

  useDidShow(() => {
    const { streak, dailyStatus } = getBrushOverview()
    syncOverview(streak, dailyStatus)

    if (shouldShowBrushOnboarding()) {
      Taro.showModal({
        title: '欢迎使用今天刷牙了吗',
        content:
          '本应用基于巴氏刷牙法，将口腔分为15个区域，每个区域停留约10秒。牙刷45度角对准牙龈线，小幅水平震颤，科学刷牙从今天开始！',
        showCancel: false,
        confirmText: '开始使用',
      })
      markBrushOnboardingSeen()
    }
  })

  useInterval(tickFlow, session.state === 'countdown' || session.state === 'brushing' ? 1000 : undefined)

  useEffect(() => {
    if (interactionVersion === 0 || !interactionAction) {
      return
    }

    vibrateBrushTap()
    if (interactionAction === 'start') {
      playBrushStartAudio()
      trackEvent('brush_start')
    }
  }, [interactionAction, interactionVersion])

  useEffect(() => {
    if (session.state === 'brushing' && session.currentStepIndex > 0) {
      vibrateBrushStepChange()
      playBrushStepAudio(session.currentStepIndex)
      trackEvent('brush_step_complete', { stepIndex: session.currentStepIndex })
      return
    }

    if (session.state === 'brushing' && session.currentStepIndex === 0) {
      playBrushStepAudio(0)
    }
  }, [session.currentStepIndex, session.state])

  // 暂停时长追踪
  useEffect(() => {
    if (session.state === 'paused') {
      pauseStartRef.current = Date.now()
    }
    else if (session.state === 'brushing' && pauseStartRef.current > 0) {
      const pausedSec = Math.round((Date.now() - pauseStartRef.current) / 1000)
      pauseStartRef.current = 0
      if (pausedSec > 0) {
        addPauseDuration(pausedSec)
      }
    }
  }, [session.state, addPauseDuration])

  useEffect(() => {
    if (session.state !== 'completed') {
      completedHandledRef.current = false
      return
    }

    if (completedHandledRef.current) {
      return
    }

    completedHandledRef.current = true

    saveBrushCompletionRecord(session)

    // 异步上报云端（不阻塞 UI）
    syncBrushRecordToCloud(session)

    trackEvent('brush_complete', { elapsedTime: session.elapsedTime })

    vibrateBrushComplete()
    playBrushCompleteAudio()

    const { streak: newStreak, dailyStatus } = getBrushOverview()
    syncOverview(newStreak, dailyStatus)
    applyCompletionMeta(newStreak)
  }, [session.state, session.elapsedTime, syncOverview, applyCompletionMeta])

  useEffect(() => {
    setBrushScreenWakeLock(session.state === 'brushing' || session.state === 'countdown')
  }, [session.state])

  useUnmount(() => {
    const s = sessionRef.current
    if (s.state === 'brushing' || s.state === 'paused') {
      saveBrushAbandonedRecord(s)
      syncBrushAbandonedRecordToCloud(s)
    }
    setBrushScreenWakeLock(false)
    destroyBrushAudio()
  })
}
