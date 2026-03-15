import { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
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
    if (!settings.reminderEnabled) {
      // 打开提醒时，提示用户手动设置手机闹钟
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
              <View
                className={`${styles.switchThumb} ${settings.reminderEnabled ? styles.switchThumbOn : ''}`}
              />
            </View>
          </View>
        </View>

        <View className={styles.item}>
          <View>
            <Text className={styles.itemLabel}>步骤提示音</Text>
            <Text className={styles.itemDesc}>切换刷牙区域时播放提示音</Text>
          </View>
          <View className={styles.itemRight}>
            <View
              className={`${styles.switchTrack} ${settings.soundEnabled ? styles.switchTrackOn : ''}`}
              onClick={handleSoundToggle}
            >
              <View
                className={`${styles.switchThumb} ${settings.soundEnabled ? styles.switchThumbOn : ''}`}
              />
            </View>
          </View>
        </View>
      </View>

      {/* 数据安全 */}
      <View className={styles.dataNotice}>
        <Text className={styles.dataNoticeTitle}>数据存储说明</Text>
        <Text className={styles.dataNoticeText}>
          所有刷牙记录和设置均保存在您的设备本地，不会上传至任何服务器。卸载小程序或清除缓存将导致数据丢失，请知悉。
        </Text>
      </View>

      {/* 关于 */}
      <View className={styles.section}>
        <View className={styles.about}>
          <Text className={styles.aboutTitle}>刷了吗</Text>
          <Text className={styles.aboutVersion}>v1.2.0</Text>
          <Text className={styles.aboutDesc}>
            基于巴氏（Bass）刷牙法，科学引导你正确刷牙。每次2.5分钟，15个区域全覆盖，养成良好的口腔卫生习惯。
          </Text>
        </View>
      </View>
    </View>
  )
}
