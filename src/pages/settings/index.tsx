import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useTimeTheme } from '../../hooks/useTimeTheme'
import { getThemeClassName } from '../../services/theme'
import { getSettings, saveSettings } from '../../services/storage'
import InPageTabBar from '../../components/InPageTabBar'
import ShadSwitch from '../../components/ui/ShadSwitch'
import { getPageTopPadding } from '../../utils/layout'
import type { UserSettings, ThemePreference } from '../../types'

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'auto', label: '自动' },
  { value: 'day', label: '白天' },
  { value: 'night', label: '黑夜' },
]

export default function SettingsPage() {
  const { themeMode, refreshTheme } = useTimeTheme()
  const safeTopPadding = getPageTopPadding(20)
  const [settings, setSettings] = useState<UserSettings>(getSettings)

  useDidShow(() => {
    setSettings(getSettings())
  })

  const handleReminderToggle = () => {
    if (!settings.reminderEnabled) {
      Taro.showModal({
        title: '设置提醒',
        content: `当前版本暂不支持自动推送提醒。\n\n建议您在手机闹钟中设置每天 ${settings.reminderTime} 的刷牙提醒。`,
        showCancel: false,
        confirmText: '我知道了',
      })
    }
    const updated = { ...settings, reminderEnabled: !settings.reminderEnabled }
    setSettings(updated)
    saveSettings({ reminderEnabled: updated.reminderEnabled })
  }

  const handleSoundToggle = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled }
    setSettings(updated)
    saveSettings({ soundEnabled: updated.soundEnabled })
  }

  const handleVoiceToggle = () => {
    const updated = { ...settings, voiceEnabled: !settings.voiceEnabled }
    setSettings(updated)
    saveSettings({ voiceEnabled: updated.voiceEnabled })
  }

  const handleThemeChange = (value: ThemePreference) => {
    const updated = { ...settings, themePreference: value }
    setSettings(updated)
    saveSettings({ themePreference: value })
    refreshTheme()
  }

  const handleSetAlarm = () => {
    Taro.showModal({
      title: '设置闹钟',
      content: `建议在系统闹钟中设置：\n晨间 ${settings.reminderTime}\n晚间 22:00`,
      showCancel: false,
      confirmText: '知道了',
    })
  }

  return (
    <View className={`theme-page app-scroll ${getThemeClassName(themeMode)}`}>
      <View className="pb-32 px-6 max-w-2xl mx-auto space-y-4" style={{ paddingTop: safeTopPadding }}>
        {/* 主题切换 */}
        <View className="bg-surface-white p-5 rounded-xl shadow-sm shadow-emerald-900/5 border border-line-light">
          <Text className="text-sm font-bold tracking-[0.08em] text-content-secondary">外观</Text>
          <View className="mt-4 flex items-center justify-between">
            <Text className="text-sm font-semibold text-content">主题模式</Text>
            <View className="flex rounded-lg overflow-hidden border border-line-light shrink-0">
              {THEME_OPTIONS.map((opt) => (
                <View
                  key={opt.value}
                  className={`px-4 py-1.5 ${
                    settings.themePreference === opt.value
                      ? 'bg-primary text-surface-white'
                      : 'bg-surface text-content-secondary'
                  }`}
                  onClick={() => handleThemeChange(opt.value)}
                >
                  <Text className={`text-sm font-medium ${
                    settings.themePreference === opt.value ? 'text-surface-white' : 'text-content-secondary'
                  }`}>{opt.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 提醒与音效 */}
        <View className="bg-surface-white p-5 rounded-xl shadow-sm shadow-emerald-900/5 border border-line-light">
          <Text className="text-sm font-bold tracking-[0.08em] text-content-secondary">提醒与音效</Text>

          <View className="mt-4 space-y-4">
            <View className="flex items-center justify-between">
              <View className="flex flex-col mr-3">
                <Text className="text-sm font-semibold text-content">刷牙提醒</Text>
                <Text className="text-sm font-medium text-content-tertiary">{settings.reminderTime}</Text>
              </View>
              <ShadSwitch checked={settings.reminderEnabled} onClick={handleReminderToggle} ariaLabel="刷牙提醒开关" />
            </View>

            <View className="flex items-center justify-between">
              <View className="flex flex-col mr-3">
                <Text className="text-sm font-semibold text-content">步骤提示音</Text>
                <Text className="text-sm font-medium text-content-tertiary">步骤切换时播放提示音</Text>
              </View>
              <ShadSwitch checked={settings.soundEnabled} onClick={handleSoundToggle} ariaLabel="步骤提示音开关" />
            </View>

            <View className="flex items-center justify-between">
              <View className="flex flex-col mr-3">
                <Text className="text-sm font-semibold text-content">语音播报</Text>
                <Text className="text-sm font-medium text-content-tertiary">步骤切换时朗读提示</Text>
              </View>
              <ShadSwitch checked={settings.voiceEnabled} onClick={handleVoiceToggle} ariaLabel="语音播报开关" />
            </View>
          </View>

          <View
            className="mt-5 w-full min-h-11 bg-surface text-content py-3.5 rounded-full text-base font-semibold flex items-center justify-center gap-2 active:scale-95"
            onClick={handleSetAlarm}
          >
            <Text className="text-base">⏰</Text>
            <Text>设置闹钟</Text>
          </View>
        </View>
      </View>

      <InPageTabBar current="settings" />
    </View>
  )
}
