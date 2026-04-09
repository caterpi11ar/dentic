import type { ReactNode } from 'react'
import type { UserSettings } from '@/types'
import { createContext } from 'react'
import { persist } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'
import { createTaroStorage } from './middleware/taroStorage'
import { useVanillaStore } from './useVanillaStore'

// ── 类型 ──

const DEFAULT_SETTINGS: UserSettings = {
  reminderEnabled: false,
  reminderTime: '07:30',
  soundEnabled: true,
  voiceEnabled: true,
  aiEnabled: true,
}

interface SettingsState extends UserSettings {
  updateSettings: (partial: Partial<UserSettings>) => void
}

// ── Store ──

export const settingsStore = createStore<SettingsState>()(
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

// ── Context & Provider ──

const SettingsStoreContext = createContext(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  return (
    <SettingsStoreContext.Provider value={null}>
      {children}
    </SettingsStoreContext.Provider>
  )
}

// ── Hook ──

export function useSettingsStore<T>(selector: (state: SettingsState) => T): T {
  return useVanillaStore(settingsStore, selector)
}
