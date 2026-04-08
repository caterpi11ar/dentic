import type { BrushingRecord } from '@/types'
import { recordsStore } from '@/stores/records'

export function getRecords(): BrushingRecord[] {
  return recordsStore.getState().records
}

export function saveRecord(record: BrushingRecord): void {
  recordsStore.getState().saveRecord(record)
}

export function getRecordsByDate(date: string): BrushingRecord[] {
  return recordsStore.getState().records.filter(r => r.date === date)
}

export function getRecordsByMonth(year: number, month: number): BrushingRecord[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return recordsStore.getState().records.filter(r => r.date.startsWith(prefix))
}

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
