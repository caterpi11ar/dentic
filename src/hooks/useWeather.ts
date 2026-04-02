import { useState } from 'react'
import { useDidShow } from '@tarojs/taro'
import {
  getCachedWeather,
  fetchWeather,
  type WeatherData,
} from '@/services/weatherService'

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(getCachedWeather)
  const [loading, setLoading] = useState(() => !getCachedWeather())

  useDidShow(() => {
    fetchWeather().then((result) => {
      setWeather(result.data)
      setLoading(false)
    })
  })

  return { weather, loading }
}
