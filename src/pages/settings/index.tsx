import { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useTimeTheme } from '../../hooks/useTimeTheme'
import { getThemeClassName } from '../../services/theme'
import { getSettings, saveSettings } from '../../services/storage'
import ShadBadge from '../../components/ui/ShadBadge'
import { ShadCard, ShadCardContent, ShadCardHeader } from '../../components/ui/ShadCard'
import ShadSwitch from '../../components/ui/ShadSwitch'
import type { UserSettings } from '../../types'

export default function SettingsPage() {
  const { themeMode } = useTimeTheme()
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
    <View className={`theme-page app-scroll ${getThemeClassName(themeMode)}`}>
      <View className="relative min-h-screen px-4 pt-3 pb-3">
        <ShadCard className="rounded-3xl mb-3">
          <ShadCardContent className="py-5 flex flex-col gap-3">
            <View className="flex items-center gap-3">
              <View className="size-14 rounded-2xl bg-surface border border-line flex items-center justify-center p-2">
                <Image className="w-full h-full" src="/logo.png" mode="aspectFit" />
              </View>
              <View>
                <Text className="text-base font-semibold text-content">刷了吗</Text>
                <Text className="block mt-1 text-xs text-content-secondary">v1.2.0</Text>
              </View>
            </View>
            <ShadBadge variant="secondary" className="self-start">
              {themeMode === 'day' ? '日间' : '夜间'}
            </ShadBadge>
          </ShadCardContent>
        </ShadCard>

        <ShadCard className="rounded-3xl mb-3">
          <ShadCardHeader>
            <Text className="text-xs text-content-secondary font-medium tracking-wide">偏好设置</Text>
          </ShadCardHeader>
          <ShadCardContent className="pt-2 flex flex-col gap-2">
            <View className="rounded-xl border border-line-light bg-surface px-3 py-3 flex flex-col gap-3">
              <View>
                <Text className="text-sm text-content font-medium">刷牙提醒</Text>
                <Text className="mt-1 text-xs text-content-secondary">提醒时间 {settings.reminderTime}</Text>
              </View>
              <View className="self-start">
                <ShadSwitch checked={settings.reminderEnabled} onClick={handleReminderToggle} ariaLabel="刷牙提醒" />
              </View>
            </View>

            <View className="rounded-xl border border-line-light bg-surface px-3 py-3 flex flex-col gap-3">
              <View>
                <Text className="text-sm text-content font-medium">步骤提示音</Text>
                <Text className="mt-1 text-xs text-content-secondary">步骤切换时播放提示</Text>
              </View>
              <View className="self-start">
                <ShadSwitch checked={settings.soundEnabled} onClick={handleSoundToggle} ariaLabel="步骤提示音" />
              </View>
            </View>
          </ShadCardContent>
        </ShadCard>

        <ShadCard className="rounded-3xl mb-3">
          <ShadCardHeader>
            <Text className="text-xs text-content-secondary font-medium tracking-wide">主题规则</Text>
          </ShadCardHeader>
          <ShadCardContent className="pt-2">
            <View className="rounded-xl border border-line-light bg-surface px-3 py-3">
              <Text className="text-sm font-medium text-content">自动时间切换</Text>
              <Text className="text-xs text-content-secondary mt-1 leading-relaxed">
                日间主题：06:00 - 17:59；夜间主题：18:00 - 次日05:59。主题随设备本地时间自动更新。
              </Text>
            </View>
          </ShadCardContent>
        </ShadCard>

        <ShadCard className="rounded-3xl mb-3">
          <ShadCardHeader>
            <Text className="text-xs text-content-secondary font-medium tracking-wide">数据与隐私</Text>
          </ShadCardHeader>
          <ShadCardContent className="pt-2">
            <Text className="text-xs text-content-secondary leading-relaxed">
              所有数据仅保存在本地设备，不上传服务器。
            </Text>
          </ShadCardContent>
        </ShadCard>

        <ShadCard className="rounded-3xl">
          <ShadCardHeader>
            <Text className="text-xs text-content-secondary font-medium tracking-wide">关于</Text>
          </ShadCardHeader>
          <ShadCardContent className="pt-2">
            <Text className="text-xs text-content-secondary leading-relaxed">
              基于巴氏刷牙法，覆盖 15 个区域科学引导。
            </Text>
          </ShadCardContent>
        </ShadCard>
      </View>
    </View>
  )
}
