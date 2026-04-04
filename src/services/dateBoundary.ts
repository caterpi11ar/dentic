export const BUSINESS_DAY_START_HOUR = 4
export const EVENING_SESSION_START_HOUR = 12

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getBusinessAnchorDate(date: Date): Date {
  const anchor = new Date(date)
  if (anchor.getHours() < BUSINESS_DAY_START_HOUR) {
    anchor.setDate(anchor.getDate() - 1)
  }
  return anchor
}

export function getBusinessDate(date: Date): string {
  return formatDate(getBusinessAnchorDate(date))
}

export function getBusinessDateOffset(date: Date, offsetDays: number): string {
  const shifted = new Date(date)
  shifted.setDate(shifted.getDate() + offsetDays)
  return getBusinessDate(shifted)
}

export function isMorningSessionHour(hour: number): boolean {
  return hour >= BUSINESS_DAY_START_HOUR && hour < EVENING_SESSION_START_HOUR
}

export function isEveningSessionHour(hour: number): boolean {
  return !isMorningSessionHour(hour)
}
