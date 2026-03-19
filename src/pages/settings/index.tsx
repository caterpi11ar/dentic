import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useTimeTheme } from '../../hooks/useTimeTheme'
import { getThemeClassName } from '../../services/theme'
import { getSettings, saveSettings } from '../../services/storage'
import InPageTabBar from '../../components/InPageTabBar'
import { getPageTopPadding } from '../../utils/layout'
import type { UserSettings } from '../../types'

type ToggleProps = {
  checked: boolean
  onClick: () => void
  ariaLabel: string
}

function ToggleSwitch({ checked, onClick, ariaLabel }: ToggleProps) {
  return (
    <View
      className={`w-11 h-6 rounded-full relative ${checked ? 'bg-primary' : 'bg-line'}`}
      onClick={onClick}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
    >
      <View
        className={`absolute top-[2px] h-5 w-5 rounded-full bg-surface-white border border-line-light transition-[left] duration-200 ${
          checked ? 'left-[22px]' : 'left-[2px]'
        }`}
      />
    </View>
  )
}

export default function SettingsPage() {
  const { themeMode } = useTimeTheme()
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
      <View className="pb-32 px-6 max-w-2xl mx-auto space-y-6" style={{ paddingTop: safeTopPadding }}>
        <View className="bg-surface-white p-6 rounded-xl space-y-6 shadow-sm shadow-emerald-900/5 border border-line-light">
          <Text className="text-sm font-bold tracking-[0.08em] text-content-secondary">习惯提醒</Text>

          <View className="flex items-center gap-3 -mt-1">
            <Text className="text-primary text-lg">🔔</Text>
            <Text className="text-sm font-semibold text-content">提醒</Text>
          </View>

          <View className="space-y-4">
            <View className="flex items-center justify-between">
              <View className="flex flex-col">
                <Text className="text-sm font-semibold text-content">刷牙提醒</Text>
                <Text className="text-sm font-medium text-content-tertiary">{settings.reminderTime}</Text>
              </View>
              <ToggleSwitch checked={settings.reminderEnabled} onClick={handleReminderToggle} ariaLabel="刷牙提醒开关" />
            </View>

            <View className="flex items-center justify-between">
              <View className="flex flex-col">
                <Text className="text-sm font-semibold text-content">步骤提示音</Text>
                <Text className="text-sm font-medium text-content-tertiary">步骤切换时播放提示音</Text>
              </View>
              <ToggleSwitch checked={settings.soundEnabled} onClick={handleSoundToggle} ariaLabel="步骤提示音开关" />
            </View>
          </View>

          <View
            className="w-full min-h-11 bg-surface text-content py-3.5 rounded-full text-base font-semibold flex items-center justify-center gap-2 active:scale-95"
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
