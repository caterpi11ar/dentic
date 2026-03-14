import Taro from '@tarojs/taro'
import type { BrushingRecord, UserSettings } from '../types'

const STORAGE_KEYS = {
  RECORDS: 'brushing_records',
  SETTINGS: 'user_settings',
}

const DEFAULT_SETTINGS: UserSettings = {
  stepDuration: 10,
  reminderEnabled: false,
  reminderTime: '07:30',
}

// ---- 刷牙记录 ----

export function getRecords(): BrushingRecord[] {
  try {
    return Taro.getStorageSync(STORAGE_KEYS.RECORDS) || []
  } catch {
    return []
  }
}

export function saveRecord(record: BrushingRecord): void {
  const records = getRecords()
  // 同一天只保留最后一条
  const idx = records.findIndex((r) => r.date === record.date)
  if (idx >= 0) {
    records[idx] = record
  } else {
    records.push(record)
  }
  Taro.setStorageSync(STORAGE_KEYS.RECORDS, records)
}

export function getRecordByDate(date: string): BrushingRecord | undefined {
  return getRecords().find((r) => r.date === date)
}

export function getRecordsByMonth(year: number, month: number): BrushingRecord[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return getRecords().filter((r) => r.date.startsWith(prefix))
}

// ---- 连续天数 ----

export function getCurrentStreak(): number {
  const records = getRecords()
    .filter((r) => r.completed)
    .sort((a, b) => b.date.localeCompare(a.date))

  if (records.length === 0) return 0

  const today = formatDate(new Date())
  const yesterday = formatDate(new Date(Date.now() - 86400000))

  // 连续天数必须包含今天或昨天
  if (records[0].date !== today && records[0].date !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < records.length; i++) {
    const prev = new Date(records[i - 1].date)
    const curr = new Date(records[i].date)
    const diff = (prev.getTime() - curr.getTime()) / 86400000
    if (diff === 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export function getTotalBrushedDays(): number {
  return getRecords().filter((r) => r.completed).length
}

// ---- 用户设置 ----

export function getSettings(): UserSettings {
  try {
    return { ...DEFAULT_SETTINGS, ...Taro.getStorageSync(STORAGE_KEYS.SETTINGS) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Partial<UserSettings>): void {
  const current = getSettings()
  Taro.setStorageSync(STORAGE_KEYS.SETTINGS, { ...current, ...settings })
}

// ---- 工具 ----

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
