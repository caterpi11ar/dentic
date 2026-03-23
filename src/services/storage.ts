export {
  getRecords,
  saveRecord,
  getRecordsByDate,
  getRecordsByMonth,
  formatDate,
} from '@/services/recordStorage'

export {
  getCurrentStreak,
  getTotalBrushedDays,
  getWeeklyStats,
  type WeeklyStatsData,
} from '@/services/recordStatsService'

export { getSettings, saveSettings } from '@/services/settingsStorage'

export { hasSeenOnboarding, markOnboardingSeen } from '@/services/onboardingStorage'
