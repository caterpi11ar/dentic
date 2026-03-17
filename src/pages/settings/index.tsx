import { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { getSettings, saveSettings } from '../../services/storage'
import type { UserSettings } from '../../types'

export default function SettingsPage() {
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

  return (
    <View className="min-h-screen bg-surface pb-8">
      {/* 顶部品牌区域 */}
      <View className="bg-gradient-to-b from-primary-dark to-primary pt-10 pb-8 px-6 text-center">
        <View className="w-24 h-24 rounded-3xl bg-surface-white bg-opacity-15 flex items-center justify-center mx-auto mb-3 shadow-card-lg p-2">
          <Image className="w-full h-full" src="/logo.png" mode="aspectFit" />
        </View>
        <Text className="text-lg font-bold text-surface-white">刷了吗</Text>
        <Text className="text-xs text-surface-white opacity-70 mt-1">v1.2.0</Text>
      </View>

      <View className="px-4 -mt-4">
        {/* 刷牙设置 */}
        <View className="bg-surface-white rounded-2xl mb-3 overflow-hidden shadow-card-lg">
          <View className="flex items-center gap-2 px-4 pt-4 pb-1">
            <Text className="text-xs text-content-secondary font-medium tracking-wide">偏好设置</Text>
          </View>

          <View className="flex justify-between items-center px-4 py-4">
            <View className="flex items-center gap-3">
              <View className="size-9 rounded-xl bg-primary-light flex items-center justify-center">
                <Text className="text-base">⏰</Text>
              </View>
              <Text className="text-sm text-content font-medium">刷牙提醒</Text>
            </View>
            <View
              className={`w-12 h-7 rounded-full relative transition-colors duration-300 motion-reduce:transition-none ${
                settings.reminderEnabled ? 'bg-primary' : 'bg-line'
              }`}
              onClick={handleReminderToggle}
              role="switch"
              aria-checked={settings.reminderEnabled}
              aria-label="刷牙提醒"
            >
              <View
                className={`absolute top-0.5 size-6 rounded-full bg-surface-white shadow-card transition-[left] duration-300 motion-reduce:transition-none ${
                  settings.reminderEnabled ? 'left-5' : 'left-0.5'
                }`}
              />
            </View>
          </View>

          <View className="mx-4 h-px bg-line-light" />

          <View className="flex justify-between items-center px-4 py-4">
            <View className="flex items-center gap-3">
              <View className="size-9 rounded-xl bg-primary-light flex items-center justify-center">
                <Text className="text-base">🔔</Text>
              </View>
              <Text className="text-sm text-content font-medium">步骤提示音</Text>
            </View>
            <View
              className={`w-12 h-7 rounded-full relative transition-colors duration-300 motion-reduce:transition-none ${
                settings.soundEnabled ? 'bg-primary' : 'bg-line'
              }`}
              onClick={handleSoundToggle}
              role="switch"
              aria-checked={settings.soundEnabled}
              aria-label="步骤提示音"
            >
              <View
                className={`absolute top-0.5 size-6 rounded-full bg-surface-white shadow-card transition-[left] duration-300 motion-reduce:transition-none ${
                  settings.soundEnabled ? 'left-5' : 'left-0.5'
                }`}
              />
            </View>
          </View>
        </View>

        {/* 数据与隐私 */}
        <View className="bg-surface-white rounded-2xl mb-3 overflow-hidden shadow-card-lg">
          <View className="flex items-center gap-2 px-4 pt-4 pb-1">
            <Text className="text-xs text-content-secondary font-medium tracking-wide">数据与隐私</Text>
          </View>
          <View className="px-4 py-4">
            <View className="flex items-center gap-3 mb-2">
              <View className="size-9 rounded-xl bg-success-light flex items-center justify-center shrink-0">
                <Text className="text-base">🔒</Text>
              </View>
              <Text className="text-sm text-content font-medium">本地存储</Text>
            </View>
            <Text className="text-xs text-content-secondary leading-relaxed">
              所有数据仅保存在您的设备本地，不会上传至任何服务器。卸载或清除缓存将导致数据丢失。
            </Text>
          </View>
        </View>

        {/* 关于 */}
        <View className="bg-surface-white rounded-2xl overflow-hidden shadow-card-lg">
          <View className="flex items-center gap-2 px-4 pt-4 pb-1">
            <Text className="text-xs text-content-secondary font-medium tracking-wide">关于</Text>
          </View>
          <View className="px-4 py-4">
            <Text className="text-xs text-content-tertiary leading-relaxed">
              基于巴氏（Bass）刷牙法，科学引导你正确刷牙。每次2.5分钟，15个区域全覆盖，养成良好的口腔卫生习惯。
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}
