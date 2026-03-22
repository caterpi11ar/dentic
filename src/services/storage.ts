export {
  getRecords,
  saveRecord,
  getRecordsByDate,
  getRecordsByMonth,
  formatDate,
} from './recordStorage'

export {
  getCurrentStreak,
  getTotalBrushedDays,
  getWeeklyStats,
  type WeeklyStatsData,
} from './recordStatsService'

export { getSettings, saveSettings } from './settingsStorage'

export { hasSeenOnboarding, markOnboardingSeen } from './onboardingStorage'
