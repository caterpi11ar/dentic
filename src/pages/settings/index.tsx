import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { getSettings, saveSettings } from '@/services/settingsStorage'
import { applyLightThemeToChrome } from '@/services/theme'
import InPageTabBar from '@/components/InPageTabBar'
import { Card, CardContent } from '@/components/ui/Card'
import Switch from '@/components/ui/Switch'
import { getPageTopPadding } from '@/utils/layout'
import type { UserSettings } from '@/types'

export default function SettingsPage() {
  const safeTopPadding = getPageTopPadding(20)
  const [settings, setSettings] = useState<UserSettings>(getSettings)

  useDidShow(() => {
    applyLightThemeToChrome()
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

  const handleSetAlarm = () => {
    Taro.showModal({
      title: '设置闹钟',
      content: `建议在系统闹钟中设置：\n晨间 ${settings.reminderTime}\n晚间 22:00`,
      showCancel: false,
      confirmText: '知道了',
    })
  }

  return (
    <View className="theme-page app-scroll theme-day min-h-screen">
      <View className="pb-bottom-safe px-page-x max-w-2xl mx-auto flex flex-col" style={{ paddingTop: safeTopPadding }}>

        {/* ── 编辑式页面标题 ── */}
        <Text className="text-display-sm font-body font-medium tracking-tight text-content">
          设置
        </Text>
        <Text className="mt-2 text-paragraph-sm text-content/40">
          个性化你的刷牙体验
        </Text>

        {/* ── 标签式分隔线：声音与提醒 ── */}
        <View className="mt-8 flex items-center gap-3">
          <Text className="text-label-sm font-heading font-semibold tracking-[0.1em] uppercase text-content/50 shrink-0">
            声音与提醒
          </Text>
          <View className="flex-1 h-px bg-content/[0.08]" />
        </View>

        {/* ── 设置卡片组 ── */}
        <View className="mt-5 flex flex-col gap-3">
          {/* 刷牙提醒 */}
          <Card className="rounded-anthropic">
            <CardContent>
              <View className="flex items-center justify-between gap-4">
                <View className="flex items-start gap-3 flex-1 min-w-0">
                  <Text className="text-xl leading-none mt-0.5">🔔</Text>
                  <View className="flex-1 min-w-0">
                    <Text className="block text-paragraph-sm font-heading font-semibold text-content">刷牙提醒</Text>
                    <Text className="block mt-1.5 text-label-sm text-content/40">每天 {settings.reminderTime} 提醒你</Text>
                  </View>
                </View>
                <View className="shrink-0">
                  <Switch
                    checked={settings.reminderEnabled}
                    onClick={handleReminderToggle}
                    ariaLabel="刷牙提醒开关"
                  />
                </View>
              </View>
            </CardContent>
          </Card>

          {/* 步骤提示音 */}
          <Card className="rounded-anthropic">
            <CardContent>
              <View className="flex items-center justify-between gap-4">
                <View className="flex items-start gap-3 flex-1 min-w-0">
                  <Text className="text-xl leading-none mt-0.5">🎵</Text>
                  <View className="flex-1 min-w-0">
                    <Text className="block text-paragraph-sm font-heading font-semibold text-content">步骤提示音</Text>
                    <Text className="block mt-1.5 text-label-sm text-content/40">步骤切换时播放提示音</Text>
                  </View>
                </View>
                <View className="shrink-0">
                  <Switch
                    checked={settings.soundEnabled}
                    onClick={handleSoundToggle}
                    ariaLabel="步骤提示音开关"
                  />
                </View>
              </View>
            </CardContent>
          </Card>

          {/* 语音播报 */}
          <Card className="rounded-anthropic">
            <CardContent>
              <View className="flex items-center justify-between gap-4">
                <View className="flex items-start gap-3 flex-1 min-w-0">
                  <Text className="text-xl leading-none mt-0.5">🗣️</Text>
                  <View className="flex-1 min-w-0">
                    <Text className="block text-paragraph-sm font-heading font-semibold text-content">语音播报</Text>
                    <Text className="block mt-1.5 text-label-sm text-content/40">步骤切换时朗读提示</Text>
                  </View>
                </View>
                <View className="shrink-0">
                  <Switch
                    checked={settings.voiceEnabled}
                    onClick={handleVoiceToggle}
                    ariaLabel="语音播报开关"
                  />
                </View>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* ── 标签式分隔线：快捷操作 ── */}
        <View className="mt-8 flex items-center gap-3">
          <Text className="text-label-sm font-heading font-semibold tracking-[0.1em] uppercase text-content/50 shrink-0">
            快捷操作
          </Text>
          <View className="flex-1 h-px bg-content/[0.08]" />
        </View>

        {/* ── 闹钟 CTA 卡片 ── */}
        <View className="mt-5">
          <Card
            className="rounded-anthropic active:scale-[0.98] active:opacity-90 transition-[transform,opacity] duration-200"
          >
            <CardContent>
              <View
                className="flex items-center justify-between gap-4"
                role="button"
                onClick={handleSetAlarm}
                aria-label="设置闹钟"
              >
                <View className="flex items-start gap-3 flex-1 min-w-0">
                  <Text className="text-xl leading-none mt-0.5">⏰</Text>
                  <View className="flex-1 min-w-0">
                    <Text className="block text-paragraph-sm font-heading font-semibold text-content">设置闹钟</Text>
                    <Text className="block mt-1.5 text-label-sm text-content/40">在系统闹钟中设置晨间与晚间提醒</Text>
                  </View>
                </View>
                <Text className="text-lg text-content/25 shrink-0">→</Text>
              </View>
            </CardContent>
          </Card>
        </View>

      </View>

      <InPageTabBar current="settings" />
    </View>
  )
}
