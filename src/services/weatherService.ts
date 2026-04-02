import Taro from '@tarojs/taro'
import {
  OPEN_METEO_BASE_URL,
  WEATHER_CACHE_KEY,
  WEATHER_CACHE_TTL,
  WMO_WEATHER,
  WMO_WEATHER_DEFAULT,
  WMO_NIGHT_EMOJI,
} from '@/constants/weather'

export interface WeatherData {
  temp: number // 摄氏度，取整
  description: string // 中文天气描述，如"多云"
  emoji: string // 天气 emoji
  windspeed: number // km/h
  isDay: boolean
  updatedAt: number // 获取时间戳
}

export interface WeatherResult {
  data: WeatherData | null
  error: 'location_denied' | 'network_error' | null
}

export function getCachedWeather(): WeatherData | null {
  try {
    const cached = Taro.getStorageSync(WEATHER_CACHE_KEY)
    if (!cached || typeof cached.temp !== 'number' || !cached.updatedAt) return null
    if (Date.now() - cached.updatedAt > WEATHER_CACHE_TTL) return null
    return cached as WeatherData
  } catch {
    return null
  }
}

export async function fetchWeather(): Promise<WeatherResult> {
  // 先查缓存
  const cached = getCachedWeather()
  if (cached) return { data: cached, error: null }

  // 获取位置
  let lat: number
  let lon: number
  try {
    const loc = await Taro.getLocation({ type: 'wgs84' })
    lat = loc.latitude
    lon = loc.longitude
  } catch {
    return { data: null, error: 'location_denied' }
  }

  // 请求天气数据
  try {
    const res = await Taro.request({
      url: OPEN_METEO_BASE_URL,
      data: {
        latitude: lat,
        longitude: lon,
        current_weather: true,
        timezone: 'auto',
      },
      method: 'GET',
    })

    if (res.statusCode !== 200 || !res.data?.current_weather) {
      return { data: null, error: 'network_error' }
    }

    const cw = res.data.current_weather
    const code: number = cw.weathercode
    const isDay = cw.is_day === 1
    const wmo = WMO_WEATHER[code] ?? WMO_WEATHER_DEFAULT
    const emoji = (!isDay && WMO_NIGHT_EMOJI[code]) || wmo.emoji

    const weatherData: WeatherData = {
      temp: Math.round(cw.temperature),
      description: wmo.desc,
      emoji,
      windspeed: cw.windspeed,
      isDay,
      updatedAt: Date.now(),
    }

    Taro.setStorageSync(WEATHER_CACHE_KEY, weatherData)
    return { data: weatherData, error: null }
  } catch {
    return { data: null, error: 'network_error' }
  }
}
