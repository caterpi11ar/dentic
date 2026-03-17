import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { useShareAppMessage } from '@tarojs/taro'
import Calendar from '../../components/Calendar'
import ShadButton from '../../components/ui/ShadButton'
import ShadBadge from '../../components/ui/ShadBadge'
import { ShadCard, ShadCardContent, ShadCardHeader } from '../../components/ui/ShadCard'
import { useTimeTheme } from '../../hooks/useTimeTheme'
import { getThemeClassName } from '../../services/theme'
import { getRecordsByDate } from '../../services/storage'
import { generateShareMessage } from '../../services/share'
import type { BrushingRecord } from '../../types'

const SESSION_LABELS = { morning: '晨间', evening: '夜间' } as const

export default function HistoryPage() {
  const { themeMode } = useTimeTheme()
  const [selectedRecords, setSelectedRecords] = useState<BrushingRecord[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useShareAppMessage(() => generateShareMessage())

  const handleSelectDate = (date: string) => {
    setSelectedDate(date)
    setSelectedRecords(getRecordsByDate(date))
  }

  return (
    <View className={`theme-page app-scroll ${getThemeClassName(themeMode)}`}>
      <View className="relative min-h-screen px-4 pt-3 pb-3">
        <View>
          <Calendar onSelectDate={handleSelectDate} />
        </View>

        {selectedDate && (
          <ShadCard className="mt-3 rounded-3xl">
            <ShadCardHeader>
              <Text className="text-sm font-semibold text-content">{selectedDate}</Text>
            </ShadCardHeader>
            {selectedRecords.length > 0 ? (
              <ShadCardContent className="pt-2 flex flex-col gap-3">
                {selectedRecords.map((record) => (
                  <View key={`${record.date}-${record.session}`} className="rounded-2xl border border-line-light bg-surface p-4">
                    <View className="flex items-center justify-between gap-2">
                      <View className="flex items-center gap-2">
                        <View
                          className={`size-2.5 rounded-full ${record.session === 'morning' ? 'bg-warning' : 'bg-primary'}`}
                        />
                        <Text className="text-sm font-semibold text-content">
                          {SESSION_LABELS[record.session] ?? record.session}
                        </Text>
                      </View>
                      <ShadBadge variant={record.completed ? 'success' : 'outline'}>
                        {record.completed ? '已完成' : '未完成'}
                      </ShadBadge>
                    </View>

                    <View className="mt-2.5 flex flex-col gap-1.5">
                      <View className="rounded-lg bg-surface-white border border-line-light px-3 py-2 min-h-10 flex items-center justify-between">
                        <Text className="text-xs text-content-secondary">用时</Text>
                        <Text className="text-base font-semibold text-content tabular-nums leading-none">
                          {Math.floor(record.duration / 60)}:{String(record.duration % 60).padStart(2, '0')}
                        </Text>
                      </View>
                      <View className="rounded-lg bg-surface-white border border-line-light px-3 py-2 min-h-10 flex items-center justify-between">
                        <Text className="text-xs text-content-secondary">步骤</Text>
                        <Text className="text-base font-semibold text-content tabular-nums leading-none">{record.completedSteps}/15</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ShadCardContent>
            ) : (
              <ShadCardContent>
                <Text className="text-center text-content-disabled text-sm py-4">该日无刷牙记录</Text>
              </ShadCardContent>
            )}
          </ShadCard>
        )}

        <View className="mt-4 flex justify-center">
          <ShadButton
            variant="secondary"
            fullWidth={false}
            className="px-5"
            openType="share"
            aria-label="分享本月成绩"
          >
            分享本月成绩
          </ShadButton>
        </View>
      </View>
    </View>
  )
}
