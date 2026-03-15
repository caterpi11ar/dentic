import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import { getWeeklyStats, type WeeklyStatsData } from '../../services/storage'
import styles from './index.module.scss'

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

export default function WeeklyStats() {
  const [stats, setStats] = useState<WeeklyStatsData | null>(null)

  useDidShow(() => {
    setStats(getWeeklyStats())
  })

  if (!stats) return null

  const maxCount = Math.max(...stats.days.map((d) => d.count), 1)

  return (
    <View className={styles.card}>
      <Text className={styles.title}>本周概览</Text>

      <View className={styles.chart}>
        {stats.days.map((day, i) => (
          <View key={day.date} className={styles.barCol}>
            <View className={styles.barWrapper}>
              <View
                className={`${styles.bar} ${day.count > 0 ? styles.barFilled : ''}`}
                style={{ height: `${day.count > 0 ? (day.count / maxCount) * 100 : 8}%` }}
              />
            </View>
            <Text className={styles.barLabel}>{WEEKDAY_LABELS[i]}</Text>
          </View>
        ))}
      </View>

      <View className={styles.summary}>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryValue}>{stats.totalSessions}</Text>
          <Text className={styles.summaryLabel}>刷牙次数</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryValue}>
            {stats.avgDuration > 0
              ? `${Math.floor(stats.avgDuration / 60)}:${String(stats.avgDuration % 60).padStart(2, '0')}`
              : '--'}
          </Text>
          <Text className={styles.summaryLabel}>平均用时</Text>
        </View>
      </View>
    </View>
  )
}
