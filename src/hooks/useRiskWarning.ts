import type { RiskCheckData } from '@/services/api/aiApi'
import Taro, { useDidShow } from '@tarojs/taro'
import { useCallback, useState } from 'react'
import { checkRisks } from '@/services/api/aiApi'

const CACHE_KEY = 'ai_risk_warning'
const DISMISSED_KEY = 'ai_risk_dismissed'
const DISMISS_DURATION = 3 * 24 * 60 * 60 * 1000 // 3 天

function getCachedRisk(): RiskCheckData | null {
  try {
    const raw = Taro.getStorageSync(CACHE_KEY) as { data: RiskCheckData, expiry: number } | ''
    if (!raw || raw.expiry < Date.now())
      return null
    return raw.data
  }
  catch {
    return null
  }
}

function getDismissedTypes(): Record<string, number> {
  try {
    return (Taro.getStorageSync(DISMISSED_KEY) as Record<string, number>) || {}
  }
  catch {
    return {}
  }
}

export function useRiskWarning() {
  const [data, setData] = useState<RiskCheckData | null>(getCachedRisk)
  const [loading, setLoading] = useState(() => !getCachedRisk())

  useDidShow(() => {
    checkRisks()
      .then((result) => {
        setData(result)
        setLoading(false)
        Taro.setStorage({
          key: CACHE_KEY,
          data: { data: result, expiry: Date.now() + 24 * 60 * 60 * 1000 },
        }).catch(() => {})
      })
      .catch(() => {
        setLoading(false)
      })
  })

  // 过滤已关闭的风险类型
  const dismissed = getDismissedTypes()
  const now = Date.now()
  const activeRisks = data?.risks.filter(
    r => !dismissed[r.type] || dismissed[r.type] < now,
  ) ?? []

  const topRisk = activeRisks[0] ?? null
  const aiTip = topRisk ? data?.aiTip ?? topRisk.message : null

  const dismiss = useCallback((type: string) => {
    const current = getDismissedTypes()
    current[type] = Date.now() + DISMISS_DURATION
    Taro.setStorage({ key: DISMISSED_KEY, data: current }).catch(() => {})
    setData(prev => prev ? { ...prev, risks: prev.risks.filter(r => r.type !== type) } : prev)
  }, [])

  return { topRisk, aiTip, loading, dismiss }
}
