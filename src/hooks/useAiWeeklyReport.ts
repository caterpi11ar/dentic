import type { WeeklyReportData } from '@/services/api/aiApi'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { getWeeklyReport } from '@/services/api/aiApi'

const CACHE_KEY = 'ai_weekly_report'

function getCachedReport(): WeeklyReportData | null {
  try {
    const raw = Taro.getStorageSync(CACHE_KEY) as { data: WeeklyReportData, expiry: number } | ''
    if (!raw || raw.expiry < Date.now())
      return null
    return raw.data
  }
  catch {
    return null
  }
}

export function useAiWeeklyReport() {
  const [data, setData] = useState<WeeklyReportData | null>(getCachedReport)
  const [loading, setLoading] = useState(() => !getCachedReport())

  useDidShow(() => {
    getWeeklyReport()
      .then((result) => {
        setData(result)
        setLoading(false)
        Taro.setStorage({
          key: CACHE_KEY,
          data: { data: result, expiry: Date.now() + 7 * 24 * 60 * 60 * 1000 },
        }).catch(() => {})
      })
      .catch(() => {
        setLoading(false)
      })
  })

  return { data, loading }
}
