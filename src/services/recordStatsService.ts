import { getBusinessAnchorDate, getBusinessDateOffset, getWeekDates } from '@/services/dateBoundary'
import { formatDate } from '@/services/recordStorage'
import { recordsStore } from '@/stores/records'

export interface WeeklyStatsData {
  days: { date: string, count: number, totalDuration: number }[]
  totalSessions: number
  avgDuration: number
}

export interface DayCompletion {
  morning: boolean
  evening: boolean
}

export function getDayCompletion(date: string): DayCompletion {
  const records = recordsStore.getState().records
  const result: DayCompletion = { morning: false, evening: false }
  records
    .filter(record => record.date === date && record.completed)
    .forEach((record) => {
      if (record.session === 'morning')
        result.morning = true
      if (record.session === 'evening')
        result.evening = true
    })
  return result
}

export function getMonthCompletionMap(year: number, month: number): Map<string, DayCompletion> {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  const records = recordsStore.getState().records
  const map = new Map<string, DayCompletion>()
  records
    .filter(record => record.completed && record.date.startsWith(prefix))
    .forEach((record) => {
      const entry = map.get(record.date) ?? { morning: false, evening: false }
      if (record.session === 'morning')
        entry.morning = true
      if (record.session === 'evening')
        entry.evening = true
      map.set(record.date, entry)
    })
  return map
}

export function getWeekCompletionMap(anchorDateStr: string): Map<string, DayCompletion> {
  const weekDates = getWeekDates(anchorDateStr)
  const dateSet = new Set(weekDates)
  const records = recordsStore.getState().records
  const map = new Map<string, DayCompletion>()
  weekDates.forEach(date => map.set(date, { morning: false, evening: false }))
  records
    .filter(record => record.completed && dateSet.has(record.date))
    .forEach((record) => {
      const entry = map.get(record.date)!
      if (record.session === 'morning')
        entry.morning = true
      if (record.session === 'evening')
        entry.evening = true
    })
  return map
}

export function getCurrentStreak(): number {
  const records = recordsStore.getState().records.filter(record => record.completed)
  const brushedDates = [...new Set(records.map(record => record.date))].sort((a, b) =>
    b.localeCompare(a),
  )

  if (brushedDates.length === 0)
    return 0

  const now = new Date()
  const today = getBusinessDateOffset(now, 0)
  const yesterday = getBusinessDateOffset(now, -1)

  if (brushedDates[0] !== today && brushedDates[0] !== yesterday)
    return 0

  let streak = 1
  for (let i = 1; i < brushedDates.length; i++) {
    const prev = new Date(brushedDates[i - 1])
    const curr = new Date(brushedDates[i])
    const diff = (prev.getTime() - curr.getTime()) / 86400000
    if (diff === 1) {
      streak++
    }
    else {
      break
    }
  }
  return streak
}

export function getTotalBrushedDays(): number {
  const records = recordsStore.getState().records.filter(record => record.completed)
  return new Set(records.map(record => record.date)).size
}

/** 本周统计（周一到周日） */
export function getWeeklyStats(): WeeklyStatsData {
  const now = getBusinessAnchorDate(new Date())
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)

  const days: WeeklyStatsData['days'] = []
  const allRecords = recordsStore.getState().records.filter(record => record.completed)

  let totalSessions = 0
  let totalDuration = 0

  for (let i = 0; i < 7; i++) {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    const dateStr = formatDate(day)
    const dayRecords = allRecords.filter(record => record.date === dateStr)
    const count = dayRecords.length
    const duration = dayRecords.reduce((sum, record) => sum + record.duration, 0)
    days.push({ date: dateStr, count, totalDuration: duration })
    totalSessions += count
    totalDuration += duration
  }

  return {
    days,
    totalSessions,
    avgDuration: totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0,
  }
}
