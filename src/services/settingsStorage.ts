import type { UserSettings } from '@/types'
import { settingsStore } from '@/stores/settings'

export function getSettings(): UserSettings {
  const { updateSettings: _, ...settings } = settingsStore.getState()
  return settings
}

export function saveSettings(settings: Partial<UserSettings>): void {
  settingsStore.getState().updateSettings(settings)
}
