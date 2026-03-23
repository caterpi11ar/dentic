import { TOTAL_STEPS } from '@/constants/brushing-steps'
import { getSessionTypeForDate } from '@/services/brushing'
import { hasSeenOnboarding, markOnboardingSeen } from '@/services/onboardingStorage'
import {
  formatDate,
  getRecordsByDate,
  saveRecord,
} from '@/services/recordStorage'
import { getCurrentStreak } from '@/services/recordStatsService'
import type { DailyStatus } from '@/domains/brush/utils'

const EVENING_SESSION_START_HOUR = 18

function getRecordHour(timestamp?: number): number | null {
  if (typeof timestamp !== 'number') return null
  const hour = new Date(timestamp).getHours()
  return Number.isNaN(hour) ? null : hour
}

export function getTodayDailyStatus(): DailyStatus {
  const today = formatDate(new Date())
  const records = getRecordsByDate(today).filter((record) => record.completed)

  return {
    morningDone: records.some((record) => {
      if (record.session === 'morning') return true
      if (record.session !== 'evening') return false
      const hour = getRecordHour(record.timestamp)
      return hour !== null && hour < EVENING_SESSION_START_HOUR
    }),
    eveningDone: records.some((record) => {
      if (record.session !== 'evening') return false
      const hour = getRecordHour(record.timestamp)
      if (hour === null) return true
      return hour >= EVENING_SESSION_START_HOUR
    }),
  }
}

export function getBrushOverview(): { streak: number; dailyStatus: DailyStatus } {
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

export function saveBrushCompletionRecord(elapsedTime: number): void {
  const now = new Date()
  saveRecord({
    date: formatDate(now),
    session: getSessionTypeForDate(now),
    completed: true,
    duration: elapsedTime,
    completedSteps: TOTAL_STEPS,
    timestamp: now.getTime(),
  })
}
