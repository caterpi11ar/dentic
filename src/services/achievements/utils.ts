import type { FamilyDashboard } from '@/services/api/familyApi'
import type { BrushingRecord } from '@/types'
import { getBusinessDate, getBusinessDateOffset } from '@/services/dateBoundary'

/** 仅保留 completed 记录 */
export function completedRecords(records: BrushingRecord[]): BrushingRecord[] {
  return records.filter(record => record.completed)
}

/** 唯一日期集合（已完成） */
export function uniqueBrushedDates(records: BrushingRecord[]): string[] {
  return [...new Set(completedRecords(records).map(record => record.date))]
}

/** 当前连续天数（业务日维度，参考 recordStatsService.getCurrentStreak） */
export function computeCurrentStreak(records: BrushingRecord[], now: Date): number {
  const dates = uniqueBrushedDates(records).sort((a, b) => b.localeCompare(a))
  if (dates.length === 0)
    return 0

  const today = getBusinessDateOffset(now, 0)
  const yesterday = getBusinessDateOffset(now, -1)

  if (dates[0] !== today && dates[0] !== yesterday)
    return 0

  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = (prev.getTime() - curr.getTime()) / 86400000
    if (diff === 1)
      streak++
    else
      break
  }
  return streak
}

/** 累计完成次数（按记录条数计） */
export function totalCompletedSessions(records: BrushingRecord[]): number {
  return completedRecords(records).length
}

/** 累计 cleanSession 次数 */
export function totalCleanSessions(records: BrushingRecord[]): number {
  return completedRecords(records).filter(record => record.cleanSession === true).length
}

interface DayDual {
  morning: boolean
  evening: boolean
}

/** 按业务日聚合早/晚完成情况 */
export function buildDualMap(records: BrushingRecord[]): Map<string, DayDual> {
  const map = new Map<string, DayDual>()
  completedRecords(records).forEach((record) => {
    const entry = map.get(record.date) ?? { morning: false, evening: false }
    if (record.session === 'morning')
      entry.morning = true
    if (record.session === 'evening')
      entry.evening = true
    map.set(record.date, entry)
  })
  return map
}

/** 是否存在任意一日早晚双刷 */
export function hasAnyDualDay(records: BrushingRecord[]): boolean {
  const map = buildDualMap(records)
  for (const entry of map.values()) {
    if (entry.morning && entry.evening)
      return true
  }
  return false
}

/** 当前连续双刷天数（截至 today / yesterday） */
export function computeDualStreak(records: BrushingRecord[], now: Date): number {
  const map = buildDualMap(records)
  const today = getBusinessDateOffset(now, 0)
  const yesterday = getBusinessDateOffset(now, -1)

  let cursor: string
  if (map.get(today)?.morning && map.get(today)?.evening)
    cursor = today
  else if (map.get(yesterday)?.morning && map.get(yesterday)?.evening)
    cursor = yesterday
  else
    return 0

  let streak = 1
  while (true) {
    const prevDate = stepDate(cursor, -1)
    const entry = map.get(prevDate)
    if (entry?.morning && entry?.evening) {
      streak++
      cursor = prevDate
    }
    else {
      break
    }
  }
  return streak
}

function stepDate(dateStr: string, offset: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + offset)
  const yy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

// ── 家庭相关 ──

/** 家庭今日全员是否至少有一刷（任一时段均可） */
export function familyAllBrushedToday(dashboard: FamilyDashboard | null): boolean {
  if (!dashboard || dashboard.members.length < 2)
    return false
  return dashboard.members.every(
    member => member.today.morningDone || member.today.eveningDone,
  )
}

/** 家庭过去 7 天全员都至少有一刷的天数（交集） */
export function familyAllBrushedDaysCount(dashboard: FamilyDashboard | null): number {
  if (!dashboard || dashboard.members.length < 2)
    return 0
  const memberDateSets = dashboard.members.map(member =>
    new Set(
      member.weekDays
        .filter(day => day.morningDone || day.eveningDone)
        .map(day => day.date),
    ),
  )
  const [first, ...rest] = memberDateSets
  let count = 0
  first.forEach((date) => {
    if (rest.every(set => set.has(date)))
      count++
  })
  return count
}

export function getTodayDate(now: Date): string {
  return getBusinessDate(now)
}
