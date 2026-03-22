export type DailyStatus = {
  morningDone: boolean
  eveningDone: boolean
}

export function formatTodayHeading(date: Date): string {
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export function getGreeting(hour: number): string {
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
}
