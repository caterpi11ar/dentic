import { BUSINESS_DAY_START_HOUR, EVENING_SESSION_START_HOUR } from '@/services/dateBoundary'

export interface DailyStatus {
  morningDone: boolean
  eveningDone: boolean
  morningTime?: number
  eveningTime?: number
}

export function formatTodayHeading(date: Date): string {
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export function isDailyComplete(status: DailyStatus): boolean {
  return status.morningDone && status.eveningDone
}

export function getGreeting(hour: number): string {
  if (hour < BUSINESS_DAY_START_HOUR)
    return '晚上好'
  if (hour < 12)
    return '早上好'
  if (hour < EVENING_SESSION_START_HOUR)
    return '下午好'
  return '晚上好'
}
