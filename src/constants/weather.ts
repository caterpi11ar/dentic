// Open-Meteo API 配置（免费，无需 API Key）
export const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast'

// 缓存配置
export const WEATHER_CACHE_KEY = 'weather_cache'
export const WEATHER_CACHE_TTL = 15 * 60 * 1000 // 15 分钟

// WMO 天气码 → { emoji, description }
export const WMO_WEATHER: Record<number, { emoji: string, desc: string }> = {
  0: { emoji: '☀️', desc: '晴' },
  1: { emoji: '🌤️', desc: '大部晴朗' },
  2: { emoji: '⛅', desc: '多云' },
  3: { emoji: '☁️', desc: '阴' },
  45: { emoji: '🌫️', desc: '雾' },
  48: { emoji: '🌫️', desc: '雾凇' },
  51: { emoji: '🌦️', desc: '小毛毛雨' },
  53: { emoji: '🌦️', desc: '毛毛雨' },
  55: { emoji: '🌧️', desc: '大毛毛雨' },
  56: { emoji: '🌧️', desc: '冻毛毛雨' },
  57: { emoji: '🌧️', desc: '冻雨' },
  61: { emoji: '🌧️', desc: '小雨' },
  63: { emoji: '🌧️', desc: '中雨' },
  65: { emoji: '🌧️', desc: '大雨' },
  66: { emoji: '🌧️', desc: '冻雨' },
  67: { emoji: '🌧️', desc: '大冻雨' },
  71: { emoji: '❄️', desc: '小雪' },
  73: { emoji: '❄️', desc: '中雪' },
  75: { emoji: '❄️', desc: '大雪' },
  77: { emoji: '❄️', desc: '雪粒' },
  80: { emoji: '🌦️', desc: '小阵雨' },
  81: { emoji: '🌧️', desc: '阵雨' },
  82: { emoji: '🌧️', desc: '大阵雨' },
  85: { emoji: '❄️', desc: '小阵雪' },
  86: { emoji: '❄️', desc: '大阵雪' },
  95: { emoji: '⛈️', desc: '雷暴' },
  96: { emoji: '⛈️', desc: '雷暴伴冰雹' },
  99: { emoji: '⛈️', desc: '强雷暴伴冰雹' },
}

export const WMO_WEATHER_DEFAULT = { emoji: '🌤️', desc: '未知' }

// 夜间替换 emoji（晴天/少云时区分白天和夜晚）
export const WMO_NIGHT_EMOJI: Record<number, string> = {
  0: '🌙',
  1: '🌙',
}
