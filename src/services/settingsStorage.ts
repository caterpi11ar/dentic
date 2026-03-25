import Taro from '@tarojs/taro'
import type { UserSettings } from '@/types'

const SETTINGS_STORAGE_KEY = 'user_settings'

const DEFAULT_SETTINGS: UserSettings = {
  reminderEnabled: false,
  reminderTime: '07:30',
  soundEnabled: true,
  voiceEnabled: true,
}

export function getSettings(): UserSettings {
  try {
    const raw = Taro.getStorageSync(SETTINGS_STORAGE_KEY) ?? {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { themePreference: _, ...rest } = raw // strip legacy field
    return { ...DEFAULT_SETTINGS, ...rest }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Partial<UserSettings>): void {
  const current = getSettings()
  Taro.setStorageSync(SETTINGS_STORAGE_KEY, { ...current, ...settings })
}
