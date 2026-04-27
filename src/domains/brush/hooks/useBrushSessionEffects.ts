import type { DailyTip } from '@/constants/daily-tips'
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
  saveBrushCompletionRecord,
  shouldShowBrushOnboarding,
  syncBrushRecordToCloud,
} from '@/domains/brush/repositories/brushRepository'
import { evaluateAndMerge } from '@/services/achievements'
import { trackEvent } from '@/services/analytics'
import { getDailyTip } from '@/services/dailyTips'
import { getBusinessDate } from '@/services/dateBoundary'
import { achievementsStore } from '@/stores/achievements'

interface UseBrushSessionEffectsParams {
  session: BrushingSession
  tickFlow: () => void
  syncOverview: (nextStreak: number, nextStatus: DailyStatus) => void
  applyCompletionMeta: (nextStreak: number, tip: DailyTip | null, newlyUnlockedIds: string[]) => void
  interactionAction: BrushInteractionAction | null
  interactionVersion: number
  pausedOnceRef: { readonly current: boolean }
}

export function useBrushSessionEffects({
  session,
  tickFlow,
  syncOverview,
  applyCompletionMeta,
  interactionAction,
  interactionVersion,
  pausedOnceRef,
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

  useEffect(() => {
    if (session.state !== 'completed') {
      completedHandledRef.current = false
      return
    }

    if (completedHandledRef.current) {
      return
    }

    completedHandledRef.current = true

    const cleanSession = !pausedOnceRef.current
    saveBrushCompletionRecord(session.elapsedTime, { cleanSession })

    // 异步上报云端（不阻塞 UI）
    syncBrushRecordToCloud(session.elapsedTime)

    trackEvent('brush_complete', { elapsedTime: session.elapsedTime })

    vibrateBrushComplete()
    playBrushCompleteAudio()

    const { streak: newStreak, dailyStatus } = getBrushOverview()
    syncOverview(newStreak, dailyStatus)

    // 计算并落盘当日小贴士
    const today = getBusinessDate(new Date())
    const tip = getDailyTip(today, achievementsStore.getState().tipHistory)
    achievementsStore.getState().commitTipShown(today, tip.id)

    // 评估并合并成就（返回本次新解锁 ids）
    const newlyUnlockedIds = evaluateAndMerge()

    applyCompletionMeta(newStreak, tip, newlyUnlockedIds)
  }, [session.state, session.elapsedTime, syncOverview, applyCompletionMeta, pausedOnceRef])

  useEffect(() => {
    setBrushScreenWakeLock(session.state === 'brushing' || session.state === 'countdown')
  }, [session.state])

  useUnmount(() => {
    setBrushScreenWakeLock(false)
    destroyBrushAudio()
  })
}
