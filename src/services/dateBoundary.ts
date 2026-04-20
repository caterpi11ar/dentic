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

function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function getWeekDates(anchorDateStr: string): string[] {
  const anchor = parseDateString(anchorDateStr)
  const dayOfWeek = anchor.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)

  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    dates.push(formatDate(day))
  }
  return dates
}
