import Taro from '@tarojs/taro'
import type { BrushingRecord } from '@/types'

const RECORDS_STORAGE_KEY = 'brushing_records'

let cachedRecords: BrushingRecord[] | null = null

function invalidateRecordCache() {
  cachedRecords = null
}

/** 迁移旧历史：缺少 session 字段的默认设为 morning */
function migrateRecords(records: BrushingRecord[]): BrushingRecord[] {
  let migrated = false
  const result = records.map((record) => {
    if (!record.session) {
      migrated = true
      return { ...record, session: 'morning' as const }
    }
    return record
  })
  if (migrated) {
    Taro.setStorageSync(RECORDS_STORAGE_KEY, result)
  }
  return result
}

export function getRecords(): BrushingRecord[] {
  if (cachedRecords) return cachedRecords
  try {
    const raw = Taro.getStorageSync(RECORDS_STORAGE_KEY) || []
    cachedRecords = migrateRecords(raw)
    return cachedRecords
  } catch {
    return []
  }
}

/** 保存历史，去重键为 date + session */
export function saveRecord(record: BrushingRecord): void {
  const records = getRecords()
  const idx = records.findIndex((r) => r.date === record.date && r.session === record.session)
  if (idx >= 0) {
    records[idx] = record
  } else {
    records.push(record)
  }
  Taro.setStorageSync(RECORDS_STORAGE_KEY, records)
  invalidateRecordCache()
}

/** 返回某天所有历史（早/晚） */
export function getRecordsByDate(date: string): BrushingRecord[] {
  return getRecords().filter((r) => r.date === date)
}

export function getRecordsByMonth(year: number, month: number): BrushingRecord[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return getRecords().filter((r) => r.date.startsWith(prefix))
}

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
