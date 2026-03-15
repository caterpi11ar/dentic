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

// ---- 数据迁移 ----

/** 迁移旧记录：缺少 session 字段的默认设为 morning */
function migrateRecords(records: BrushingRecord[]): BrushingRecord[] {
  let migrated = false
  const result = records.map((r) => {
    if (!r.session) {
      migrated = true
      return { ...r, session: 'morning' as const }
    }
    return r
  })
  if (migrated) {
    Taro.setStorageSync(STORAGE_KEYS.RECORDS, result)
  }
  return result
}

// ---- 刷牙记录 ----

export function getRecords(): BrushingRecord[] {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEYS.RECORDS) || []
    return migrateRecords(raw)
  } catch {
    return []
  }
}

/** 保存记录，去重键为 date + session */
export function saveRecord(record: BrushingRecord): void {
  const records = getRecords()
  const idx = records.findIndex((r) => r.date === record.date && r.session === record.session)
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

/** 返回某天所有记录（早/晚） */
export function getRecordsByDate(date: string): BrushingRecord[] {
  return getRecords().filter((r) => r.date === date)
}

export function getRecordsByMonth(year: number, month: number): BrushingRecord[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return getRecords().filter((r) => r.date.startsWith(prefix))
}

// ---- 连续天数 ----

export function getCurrentStreak(): number {
  const records = getRecords().filter((r) => r.completed)
  // 按日期去重：一天有任一完成即算
  const brushedDates = [...new Set(records.map((r) => r.date))].sort((a, b) => b.localeCompare(a))

  if (brushedDates.length === 0) return 0

  const today = formatDate(new Date())
  const yesterday = formatDate(new Date(Date.now() - 86400000))

  // 连续天数必须包含今天或昨天
  if (brushedDates[0] !== today && brushedDates[0] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < brushedDates.length; i++) {
    const prev = new Date(brushedDates[i - 1])
    const curr = new Date(brushedDates[i])
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
  const records = getRecords().filter((r) => r.completed)
  return new Set(records.map((r) => r.date)).size
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
