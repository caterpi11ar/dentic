import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useTimeTheme } from '@/hooks/useTimeTheme'
import { getThemeClassName } from '@/services/theme'
import { getSettings, saveSettings } from '@/services/settingsStorage'
import InPageTabBar from '@/components/InPageTabBar'
import Button from '@/components/ui/Button'
import { List, ListItem } from '@/components/ui/List'
import Section from '@/components/ui/Section'
import Switch from '@/components/ui/Switch'
import Tabs, { type TabOption } from '@/components/ui/Tabs'
import { getPageTopPadding } from '@/utils/layout'
import type { UserSettings, ThemePreference } from '@/types'

const THEME_OPTIONS: Array<TabOption<ThemePreference>> = [
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
    <View className={`theme-page app-scroll ${getThemeClassName(themeMode)} min-h-screen`}>
      <View className="pb-32 px-5 max-w-2xl mx-auto flex flex-col gap-4" style={{ paddingTop: safeTopPadding }}>
        <Section title="外观" className="rounded-2xl">
          <List>
            <ListItem
              title="主题模式"
              right={(
                <Tabs
                  value={settings.themePreference}
                  options={THEME_OPTIONS}
                  onValueChange={handleThemeChange}
                />
              )}
            />
          </List>
        </Section>

        <Section title="提醒与音效" className="rounded-2xl">
          <List>
            <ListItem
              title="刷牙提醒"
              description={settings.reminderTime}
              right={(
                <Switch
                  checked={settings.reminderEnabled}
                  onClick={handleReminderToggle}
                  ariaLabel="刷牙提醒开关"
                />
              )}
            />
            <ListItem
              title="步骤提示音"
              description="步骤切换时播放提示音"
              right={(
                <Switch
                  checked={settings.soundEnabled}
                  onClick={handleSoundToggle}
                  ariaLabel="步骤提示音开关"
                />
              )}
            />
            <ListItem
              title="语音播报"
              description="步骤切换时朗读提示"
              right={(
                <Switch
                  checked={settings.voiceEnabled}
                  onClick={handleVoiceToggle}
                  ariaLabel="语音播报开关"
                />
              )}
            />
          </List>

          <Button
            variant="secondary"
            className="mt-4 rounded-xl min-h-11"
            onClick={handleSetAlarm}
            aria-label="设置闹钟"
          >
            <Text className="text-base">⏰ 设置闹钟</Text>
          </Button>
        </Section>
      </View>

      <InPageTabBar current="settings" />
    </View>
  )
}
