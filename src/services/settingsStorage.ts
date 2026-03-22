import Taro from '@tarojs/taro'
import type { UserSettings } from '../types'

const SETTINGS_STORAGE_KEY = 'user_settings'

const DEFAULT_SETTINGS: UserSettings = {
  reminderEnabled: false,
  reminderTime: '07:30',
  soundEnabled: true,
  voiceEnabled: true,
  themePreference: 'auto',
}

export function getSettings(): UserSettings {
  try {
    return { ...DEFAULT_SETTINGS, ...Taro.getStorageSync(SETTINGS_STORAGE_KEY) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Partial<UserSettings>): void {
  const current = getSettings()
  Taro.setStorageSync(SETTINGS_STORAGE_KEY, { ...current, ...settings })
}
