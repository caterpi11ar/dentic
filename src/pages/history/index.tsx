import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Calendar from '../../components/Calendar'
import { getRecordByDate } from '../../services/storage'
import type { BrushingRecord } from '../../types'
import styles from './index.module.scss'

export default function HistoryPage() {
  const [selectedRecord, setSelectedRecord] = useState<BrushingRecord | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const handleSelectDate = (date: string) => {
    setSelectedDate(date)
    setSelectedRecord(getRecordByDate(date) || null)
  }

  return (
    <View className={styles.page}>
      <Calendar onSelectDate={handleSelectDate} />

      {selectedDate && (
        <View className={styles.detail}>
          <Text className={styles.detailTitle}>{selectedDate}</Text>
          {selectedRecord ? (
            <>
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>状态</Text>
                <Text className={styles.detailValue}>
                  {selectedRecord.completed ? '已完成' : '未完成'}
                </Text>
              </View>
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>用时</Text>
                <Text className={styles.detailValue}>
                  {Math.floor(selectedRecord.duration / 60)}分{selectedRecord.duration % 60}秒
                </Text>
              </View>
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>完成步骤</Text>
                <Text className={styles.detailValue}>{selectedRecord.completedSteps}/15</Text>
              </View>
            </>
          ) : (
            <Text className={styles.noRecord}>该日无刷牙记录</Text>
          )}
        </View>
      )}
    </View>
  )
}
