import type { HealthProfileData } from '@/services/api/aiApi'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { getHealthProfile } from '@/services/api/aiApi'

const CACHE_KEY = 'ai_health_profile'

function getCachedProfile(): HealthProfileData | null {
  try {
    const raw = Taro.getStorageSync(CACHE_KEY) as { data: HealthProfileData, expiry: number } | ''
    if (!raw || raw.expiry < Date.now())
      return null
    return raw.data
  }
  catch {
    return null
  }
}

export function useHealthProfile() {
  const [data, setData] = useState<HealthProfileData | null>(getCachedProfile)
  const [loading, setLoading] = useState(() => !getCachedProfile())

  useDidShow(() => {
    getHealthProfile()
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
