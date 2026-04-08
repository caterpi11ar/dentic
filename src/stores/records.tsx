import type { ReactNode } from 'react'
import type { StoreApi } from 'zustand'
import type { BrushingRecord } from '@/types'
import Taro from '@tarojs/taro'
import { createContext, useContext } from 'react'
import { createStore, useStore } from 'zustand'
import { persist } from 'zustand/middleware'
import { createTaroStorage } from './middleware/taroStorage'

// ── 类型 ──

interface RecordsState {
  records: BrushingRecord[]
  /** 保存历史，去重键为 date + session */
  saveRecord: (record: BrushingRecord) => void
}

type RecordsStore = StoreApi<RecordsState>

// ── 迁移 ──

const RECORDS_STORAGE_KEY = 'brushing_records'

function migrateRecords(records: unknown): BrushingRecord[] {
  if (!Array.isArray(records))
    return []
  let migrated = false
  const result = records
    .map((record) => {
      if (!record || typeof record !== 'object')
        return null
      const current = record as Partial<BrushingRecord>
      if (typeof current.date !== 'string')
        return null
      if (typeof current.completed !== 'boolean')
        return null
      if (typeof current.duration !== 'number')
        return null
      if (typeof current.completedSteps !== 'number')
        return null
      if (typeof current.timestamp !== 'number')
        return null

      if (!current.session) {
        migrated = true
        return { ...current, session: 'morning' as const } as BrushingRecord
      }
      if (current.session !== 'morning' && current.session !== 'evening')
        return null
      return current as BrushingRecord
    })
    .filter((record): record is BrushingRecord => !!record)
  if (migrated) {
    Taro.setStorageSync(RECORDS_STORAGE_KEY, result)
  }
  return result
}

// ── Store 工厂 ──

function createRecordsStore(): RecordsStore {
  return createStore<RecordsState>()(
    persist(
      (set, get) => ({
        records: [],
        saveRecord: (record) => {
          const records = [...get().records]
          const idx = records.findIndex(
            r => r.date === record.date && r.session === record.session,
          )
          if (idx >= 0) {
            records[idx] = record
          }
          else {
            records.push(record)
          }
          set({ records })
        },
      }),
      {
        name: RECORDS_STORAGE_KEY,
        storage: createTaroStorage<RecordsState>({
          deserialize: raw => ({ records: migrateRecords(raw) }),
          serialize: state => state.records ?? [],
        }),
      },
    ),
  )
}

// 模块级单例（供非 React 代码使用，如 brushRepository）
export const recordsStore = createRecordsStore()

// ── Context & Provider ──

const RecordsStoreContext = createContext<RecordsStore | null>(null)

export function RecordsProvider({ children }: { children: ReactNode }) {
  return (
    <RecordsStoreContext.Provider value={recordsStore}>
      {children}
    </RecordsStoreContext.Provider>
  )
}

// ── Hook ──

export function useRecordsStore<T>(selector: (state: RecordsState) => T): T {
  const store = useContext(RecordsStoreContext)
  if (!store)
    throw new Error('useRecordsStore 必须在 RecordsProvider 内使用')
  return useStore(store, selector)
}
