export { hasSeenOnboarding, markOnboardingSeen } from '@/services/onboardingStorage'

export {
  getCurrentStreak,
  getTotalBrushedDays,
  getWeeklyStats,
  type WeeklyStatsData,
} from '@/services/recordStatsService'

export {
  formatDate,
  getRecords,
  getRecordsByDate,
  getRecordsByMonth,
  saveRecord,
} from '@/services/recordStorage'

export { getSettings, saveSettings } from '@/services/settingsStorage'
