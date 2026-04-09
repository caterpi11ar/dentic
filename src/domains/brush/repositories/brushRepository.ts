import type { DailyStatus } from '@/domains/brush/utils'
import type { BrushingSession } from '@/services/brushing'
import type { StepDetail } from '@/types'
import { BRUSHING_STEPS, TOTAL_STEPS } from '@/constants/brushing-steps'
import { upsertBrushRecord } from '@/services/api/brushApi'
import { getSessionTypeForDate } from '@/services/brushing'
import {
  getBusinessDate,
  isEveningSessionHour,
  isMorningSessionHour,
} from '@/services/dateBoundary'
import { hasSeenOnboarding, markOnboardingSeen } from '@/services/onboardingStorage'
import { getCurrentStreak } from '@/services/recordStatsService'
import { enqueueSyncItem } from '@/services/syncQueue'
import { recordsStore } from '@/stores/records'

function getRecordHour(timestamp?: number): number | null {
  if (typeof timestamp !== 'number')
    return null
  const hour = new Date(timestamp).getHours()
  return Number.isNaN(hour) ? null : hour
}

export function getTodayDailyStatus(): DailyStatus {
  const today = getBusinessDate(new Date())
  const records = recordsStore
    .getState()
    .records
    .filter(r => r.date === today && r.completed)

  const morningRecord = records.find((record) => {
    if (record.session === 'morning')
      return true
    if (record.session !== 'evening')
      return false
    const hour = getRecordHour(record.timestamp)
    return hour !== null && isMorningSessionHour(hour)
  })

  const eveningRecord = records.find((record) => {
    if (record.session !== 'evening')
      return false
    const hour = getRecordHour(record.timestamp)
    if (hour === null)
      return true
    return isEveningSessionHour(hour)
  })

  return {
    morningDone: !!morningRecord,
    eveningDone: !!eveningRecord,
    morningTime: morningRecord?.timestamp,
    eveningTime: eveningRecord?.timestamp,
  }
}

export function getBrushOverview(): { streak: number, dailyStatus: DailyStatus } {
  return {
    streak: getCurrentStreak(),
    dailyStatus: getTodayDailyStatus(),
  }
}

export function shouldShowBrushOnboarding(): boolean {
  return !hasSeenOnboarding()
}

export function markBrushOnboardingSeen(): void {
  markOnboardingSeen()
}

function buildStepDetails(
  stepDurations: number[],
  abandonedAtStep?: number,
): StepDetail[] {
  return BRUSHING_STEPS.map((step, i) => ({
    zone: step.zone,
    actualDuration: stepDurations[i] ?? 0,
    skipped: i >= stepDurations.length && i !== abandonedAtStep,
  }))
}

export function saveBrushCompletionRecord(session: BrushingSession): void {
  const now = new Date()
  recordsStore.getState().saveRecord({
    date: getBusinessDate(now),
    session: getSessionTypeForDate(now),
    completed: true,
    duration: session.elapsedTime,
    completedSteps: TOTAL_STEPS,
    timestamp: now.getTime(),
    stepDetails: buildStepDetails(session.stepDurations),
    pauseCount: session.pauseCount,
    totalPauseDuration: session.totalPauseDuration,
  })
}

/** 异步同步刷牙记录到云端，失败时入队重试 */
export function syncBrushRecordToCloud(session: BrushingSession): void {
  const now = new Date()
  const bizDate = getBusinessDate(now)
  const sessionType = getSessionTypeForDate(now)

  upsertBrushRecord({
    bizDate,
    session: sessionType,
    completed: true,
    durationSec: session.elapsedTime,
    completedSteps: TOTAL_STEPS,
    source: 'direct',
    stepDetails: buildStepDetails(session.stepDurations),
    pauseCount: session.pauseCount,
    totalPauseDuration: session.totalPauseDuration,
  }).catch(() => {
    enqueueSyncItem({
      bizDate,
      session: sessionType,
      completed: true,
      durationSec: session.elapsedTime,
      completedSteps: TOTAL_STEPS,
      source: 'local_sync',
    })
  })
}

/** 保存中途退出的刷牙记录 */
export function saveBrushAbandonedRecord(session: BrushingSession): void {
  const now = new Date()
  const completedSteps = session.stepDurations.length
  recordsStore.getState().saveRecord({
    date: getBusinessDate(now),
    session: getSessionTypeForDate(now),
    completed: false,
    duration: session.elapsedTime,
    completedSteps,
    timestamp: now.getTime(),
    stepDetails: buildStepDetails(session.stepDurations, session.currentStepIndex),
    pauseCount: session.pauseCount,
    totalPauseDuration: session.totalPauseDuration,
    abandoned: true,
    abandonedAtStep: session.currentStepIndex,
  })
}

/** 异步同步中途退出记录到云端 */
export function syncBrushAbandonedRecordToCloud(session: BrushingSession): void {
  const now = new Date()
  const bizDate = getBusinessDate(now)
  const sessionType = getSessionTypeForDate(now)
  const completedSteps = session.stepDurations.length

  upsertBrushRecord({
    bizDate,
    session: sessionType,
    completed: false,
    durationSec: session.elapsedTime,
    completedSteps,
    source: 'direct',
    stepDetails: buildStepDetails(session.stepDurations, session.currentStepIndex),
    pauseCount: session.pauseCount,
    totalPauseDuration: session.totalPauseDuration,
    abandoned: true,
    abandonedAtStep: session.currentStepIndex,
  }).catch(() => {})
}
