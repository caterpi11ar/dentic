import type { ReactNode } from 'react'
import type { StoreApi } from 'zustand'
import type { UserSettings } from '@/types'
import { createContext, useContext } from 'react'
import { createStore, useStore } from 'zustand'
import { persist } from 'zustand/middleware'
import { createTaroStorage } from './middleware/taroStorage'

// ── 类型 ──

const DEFAULT_SETTINGS: UserSettings = {
  reminderEnabled: false,
  reminderTime: '07:30',
  soundEnabled: true,
  voiceEnabled: true,
}

interface SettingsState extends UserSettings {
  updateSettings: (partial: Partial<UserSettings>) => void
}

type SettingsStore = StoreApi<SettingsState>

// ── Store 工厂 ──

function createSettingsStore(): SettingsStore {
  return createStore<SettingsState>()(
    persist(
      set => ({
        ...DEFAULT_SETTINGS,
        updateSettings: partial => set(state => ({ ...state, ...partial })),
      }),
      {
        name: 'user_settings',
        storage: createTaroStorage<SettingsState>({
          deserialize: (raw) => {
            const { themePreference: _, ...rest } = (raw ?? {}) as Record<string, unknown>
            return { ...DEFAULT_SETTINGS, ...rest }
          },
          serialize: ({ updateSettings: _, ...settings }) => settings,
        }),
      },
    ),
  )
}

// 模块级单例（供非 React 代码使用，如 audio.ts）
export const settingsStore = createSettingsStore()

// ── Context & Provider ──

const SettingsStoreContext = createContext<SettingsStore | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  return (
    <SettingsStoreContext.Provider value={settingsStore}>
      {children}
    </SettingsStoreContext.Provider>
  )
}

// ── Hook ──

export function useSettingsStore<T>(selector: (state: SettingsState) => T): T {
  const store = useContext(SettingsStoreContext)
  if (!store)
    throw new Error('useSettingsStore 必须在 SettingsProvider 内使用')
  return useStore(store, selector)
}
