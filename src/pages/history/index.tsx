import { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import { useShareAppMessage } from '@tarojs/taro'
import Calendar from '../../components/Calendar'
import WeeklyStats from '../../components/WeeklyStats'
import { getRecordsByDate } from '../../services/storage'
import { generateShareMessage } from '../../services/share'
import type { BrushingRecord } from '../../types'
import styles from './index.module.scss'

const SESSION_LABELS = { morning: '早上', evening: '晚上' } as const

export default function HistoryPage() {
  const [selectedRecords, setSelectedRecords] = useState<BrushingRecord[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useShareAppMessage(() => generateShareMessage())

  const handleSelectDate = (date: string) => {
    setSelectedDate(date)
    setSelectedRecords(getRecordsByDate(date))
  }

  return (
    <View className={styles.page}>
      <WeeklyStats />
      <Calendar onSelectDate={handleSelectDate} />

      <View className={styles.shareRow}>
        <Button className={styles.shareBtn} openType="share">
          分享本月成绩
        </Button>
      </View>

      {selectedDate && (
        <View className={styles.detail}>
          <Text className={styles.detailTitle}>{selectedDate}</Text>
          {selectedRecords.length > 0 ? (
            selectedRecords.map((record) => (
              <View key={`${record.date}-${record.session}`} className={styles.recordCard}>
                <Text className={styles.recordSession}>
                  {SESSION_LABELS[record.session] ?? record.session}
                </Text>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>状态</Text>
                  <Text className={styles.detailValue}>
                    {record.completed ? '已完成' : '未完成'}
                  </Text>
                </View>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>用时</Text>
                  <Text className={styles.detailValue}>
                    {Math.floor(record.duration / 60)}分{record.duration % 60}秒
                  </Text>
                </View>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>完成步骤</Text>
                  <Text className={styles.detailValue}>{record.completedSteps}/15</Text>
                </View>
              </View>
            ))
          ) : (
            <Text className={styles.noRecord}>该日无刷牙记录</Text>
          )}
        </View>
      )}
    </View>
  )
}
