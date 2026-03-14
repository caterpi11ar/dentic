import { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import { getSettings, saveSettings } from '../../services/storage'
import type { UserSettings } from '../../types'
import styles from './index.module.scss'

const DURATION_OPTIONS = [8, 10, 15]

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(getSettings)

  useDidShow(() => {
    setSettings(getSettings())
  })

  const handleDurationChange = (duration: number) => {
    const updated = { ...settings, stepDuration: duration }
    setSettings(updated)
    saveSettings({ stepDuration: duration })
  }

  const handleReminderToggle = () => {
    const updated = { ...settings, reminderEnabled: !settings.reminderEnabled }
    setSettings(updated)
    saveSettings({ reminderEnabled: updated.reminderEnabled })
  }

  return (
    <View className={styles.page}>
      {/* 刷牙设置 */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>刷牙设置</Text>

        <View className={styles.item}>
          <View>
            <Text className={styles.itemLabel}>每步时长</Text>
            <Text className={styles.itemDesc}>每个刷牙区域的停留时间</Text>
          </View>
          <View className={styles.durationOptions}>
            {DURATION_OPTIONS.map((d) => (
              <Button
                key={d}
                className={`${styles.durationBtn} ${settings.stepDuration === d ? styles.durationBtnActive : ''}`}
                onClick={() => handleDurationChange(d)}
              >
                {d}秒
              </Button>
            ))}
          </View>
        </View>

        <View className={styles.item}>
          <View>
            <Text className={styles.itemLabel}>刷牙提醒</Text>
            <Text className={styles.itemDesc}>每天定时提醒刷牙</Text>
          </View>
          <View className={styles.itemRight}>
            <View
              className={`${styles.switchTrack} ${settings.reminderEnabled ? styles.switchTrackOn : ''}`}
              onClick={handleReminderToggle}
            >
              <View className={`${styles.switchThumb} ${settings.reminderEnabled ? styles.switchThumbOn : ''}`} />
            </View>
          </View>
        </View>
      </View>

      {/* 关于 */}
      <View className={styles.section}>
        <View className={styles.about}>
          <Text className={styles.aboutTitle}>刷了吗</Text>
          <Text className={styles.aboutVersion}>v1.0.0</Text>
          <Text className={styles.aboutDesc}>
            基于巴氏（Bass）刷牙法，科学引导你正确刷牙。每次2.5分钟，15个区域全覆盖，养成良好的口腔卫生习惯。
          </Text>
        </View>
      </View>
    </View>
  )
}
