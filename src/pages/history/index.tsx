import { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import { useShareAppMessage } from '@tarojs/taro'
import Calendar from '../../components/Calendar'
import WeeklyStats from '../../components/WeeklyStats'
import { getRecordsByDate } from '../../services/storage'
import { generateShareMessage } from '../../services/share'
import type { BrushingRecord } from '../../types'

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
    <View className="min-h-screen bg-surface">
      <View className="px-4 pt-3 pb-6">
        <WeeklyStats />
        <Calendar onSelectDate={handleSelectDate} />

        {selectedDate && (
          <View className="mt-3 bg-surface-white rounded-2xl p-4 shadow-card-lg">
            <Text className="text-sm font-bold text-content mb-3">{selectedDate}</Text>
            {selectedRecords.length > 0 ? (
              selectedRecords.map((record) => (
                <View key={`${record.date}-${record.session}`} className="mb-3 last:mb-0">
                  <View className="flex items-center gap-2 mb-2">
                    <View className={`size-2 rounded-full ${record.session === 'morning' ? 'bg-warning' : 'bg-primary'}`} />
                    <Text className="text-sm font-medium text-content">
                      {SESSION_LABELS[record.session] ?? record.session}
                    </Text>
                    <View className={`px-2 py-0.5 rounded-full ${record.completed ? 'bg-success-light' : 'bg-line'}`}>
                      <Text className={`text-xs ${record.completed ? 'text-success-text' : 'text-content-secondary'}`}>
                        {record.completed ? '已完成' : '未完成'}
                      </Text>
                    </View>
                  </View>
                  <View className="bg-surface rounded-xl p-3 flex justify-around">
                    <View className="flex flex-col items-center">
                      <Text className="text-base font-bold text-content tabular-nums">
                        {Math.floor(record.duration / 60)}:{String(record.duration % 60).padStart(2, '0')}
                      </Text>
                      <Text className="text-xs text-content-secondary mt-0.5">用时</Text>
                    </View>
                    <View className="w-px bg-line-light" />
                    <View className="flex flex-col items-center">
                      <Text className="text-base font-bold text-content tabular-nums">{record.completedSteps}/15</Text>
                      <Text className="text-xs text-content-secondary mt-0.5">步骤</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-center text-content-disabled text-sm py-4">该日无刷牙记录</Text>
            )}
          </View>
        )}

        <View className="mt-4 flex justify-center">
          <Button className="h-8 px-5 rounded-full bg-surface-white text-content-secondary text-xs border border-solid border-line flex items-center justify-center" openType="share" aria-label="分享本月成绩">
            分享本月成绩
          </Button>
        </View>
      </View>
    </View>
  )
}
