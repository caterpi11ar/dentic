import { useState, useMemo } from 'react'
import { View, Text, Button } from '@tarojs/components'
import { getRecordsByMonth, getCurrentStreak, getTotalBrushedDays, formatDate } from '../../services/storage'
import styles from './index.module.scss'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

interface Props {
  onSelectDate?: (date: string) => void
}

export default function Calendar({ onSelectDate }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const records = useMemo(() => getRecordsByMonth(year, month), [year, month])
  const brushedDates = useMemo(
    () => new Set(records.filter((r) => r.completed).map((r) => r.date)),
    [records]
  )

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()

  const streak = getCurrentStreak()
  const totalDays = getTotalBrushedDays()
  const monthBrushed = records.filter((r) => r.completed).length

  const todayStr = formatDate(today)

  const goToPrevMonth = () => {
    if (month === 1) {
      setYear(year - 1)
      setMonth(12)
    } else {
      setMonth(month - 1)
    }
  }

  const goToNextMonth = () => {
    if (month === 12) {
      setYear(year + 1)
      setMonth(1)
    } else {
      setMonth(month + 1)
    }
  }

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
    onSelectDate?.(dateStr)
  }

  return (
    <View className={styles.calendar}>
      {/* 月份导航 */}
      <View className={styles.header}>
        <Button className={styles.navBtn} onClick={goToPrevMonth}>‹</Button>
        <Text className={styles.monthTitle}>{year}年{month}月</Text>
        <Button className={styles.navBtn} onClick={goToNextMonth}>›</Button>
      </View>

      {/* 星期标题 */}
      <View className={styles.weekdays}>
        {WEEKDAYS.map((w) => (
          <Text key={w} className={styles.weekday}>{w}</Text>
        ))}
      </View>

      {/* 日期格子 */}
      <View className={styles.days}>
        {/* 填充首日之前的空格 */}
        {Array.from({ length: firstDayOfWeek }, (_, i) => (
          <View key={`empty-${i}`} className={`${styles.day} ${styles.dayEmpty}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isBrushed = brushedDates.has(dateStr)
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate

          let cls = styles.day
          if (isBrushed) cls += ` ${styles.dayBrushed}`
          if (isToday) cls += ` ${styles.dayToday}`
          if (isSelected) cls += ` ${styles.daySelected}`

          return (
            <View key={day} className={cls} onClick={() => handleDayClick(day)}>
              <Text>{day}</Text>
              {isBrushed && <View className={styles.dot} />}
            </View>
          )
        })}
      </View>

      {/* 统计 */}
      <View className={styles.stats}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{monthBrushed}</Text>
          <Text className={styles.statLabel}>本月</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{streak}</Text>
          <Text className={styles.statLabel}>连续</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{totalDays}</Text>
          <Text className={styles.statLabel}>总计</Text>
        </View>
      </View>
    </View>
  )
}
