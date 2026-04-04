import { useEffect, useRef } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { useInterval, useUnmount } from 'ahooks'
import type { BrushingSession } from '@/services/brushing'
import {
  destroyBrushAudio,
  playBrushCompleteAudio,
  playBrushStartAudio,
  playBrushStepAudio,
} from '@/domains/brush/effects/audioFeedback'
import { setBrushScreenWakeLock } from '@/domains/brush/effects/screenWakeLock'
import {
  getBrushOverview,
  markBrushOnboardingSeen,
  saveBrushCompletionRecord,
  shouldShowBrushOnboarding,
} from '@/domains/brush/repositories/brushRepository'
import {
  vibrateBrushTap,
  vibrateBrushComplete,
  vibrateBrushStepChange,
} from '@/domains/brush/effects/vibrationFeedback'
import type { DailyStatus } from '@/domains/brush/utils'
import type { BrushInteractionAction } from '@/domains/brush/hooks/useBrushSessionState'

interface UseBrushSessionEffectsParams {
  session: BrushingSession
  tickFlow: () => void
  syncOverview: (nextStreak: number, nextStatus: DailyStatus) => void
  applyCompletionMeta: (nextStreak: number) => void
  interactionAction: BrushInteractionAction | null
  interactionVersion: number
}

export function useBrushSessionEffects({
  session,
  tickFlow,
  syncOverview,
  applyCompletionMeta,
  interactionAction,
  interactionVersion,
}: UseBrushSessionEffectsParams): void {
  const completedHandledRef = useRef(false)

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
    }
  }, [interactionAction, interactionVersion])

  useEffect(() => {
    if (session.state === 'brushing' && session.currentStepIndex > 0) {
      vibrateBrushStepChange()
      playBrushStepAudio(session.currentStepIndex)
      return
    }

    if (session.state === 'brushing' && session.currentStepIndex === 0) {
      playBrushStepAudio(0)
    }
  }, [session.currentStepIndex, session.state])

  useEffect(() => {
    if (session.state !== 'completed') {
      completedHandledRef.current = false
      return
    }

    if (completedHandledRef.current) {
      return
    }

    completedHandledRef.current = true

    saveBrushCompletionRecord(session.elapsedTime)

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
    setBrushScreenWakeLock(false)
    destroyBrushAudio()
  })
}
