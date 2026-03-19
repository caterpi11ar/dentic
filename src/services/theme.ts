import Taro from '@tarojs/taro'
import type { ThemePreference } from '../types'

export type ThemeMode = 'day' | 'night'

const DAY_START_HOUR = 6
const NIGHT_START_HOUR = 18

const THEME_NAV_STYLE: Record<ThemeMode, { frontColor: '#ffffff' | '#000000'; backgroundColor: string }> = {
  day: {
    frontColor: '#000000',
    backgroundColor: '#EFFAF3',
  },
  night: {
    frontColor: '#ffffff',
    backgroundColor: '#07120D',
  },
}

const THEME_TAB_STYLE: Record<ThemeMode, { color: string; selectedColor: string; backgroundColor: string; borderStyle: 'white' | 'black' }> = {
  day: {
    color: '#6A7E6C',
    selectedColor: '#006D36',
    backgroundColor: '#F8FBF8',
    borderStyle: 'white',
  },
  night: {
    color: '#A1A1AA',
    selectedColor: '#6EE7B7',
    backgroundColor: '#0B1611',
    borderStyle: 'black',
  },
}

export function getThemeModeByDate(date: Date): ThemeMode {
  const hour = date.getHours()
  return hour >= DAY_START_HOUR && hour < NIGHT_START_HOUR ? 'day' : 'night'
}

export function resolveThemeMode(preference: ThemePreference, date: Date): ThemeMode {
  if (preference === 'day' || preference === 'night') return preference
  return getThemeModeByDate(date)
}

export function getThemeChangeBoundary(from: Date): Date {
  const next = new Date(from)
  const hour = from.getHours()

  if (hour >= DAY_START_HOUR && hour < NIGHT_START_HOUR) {
    next.setHours(NIGHT_START_HOUR, 0, 0, 0)
    return next
  }

  if (hour < DAY_START_HOUR) {
    next.setHours(DAY_START_HOUR, 0, 0, 0)
    return next
  }

  next.setDate(next.getDate() + 1)
  next.setHours(DAY_START_HOUR, 0, 0, 0)
  return next
}

export function applyThemeToChrome(mode: ThemeMode): void {
  const nav = THEME_NAV_STYLE[mode]
  const tab = THEME_TAB_STYLE[mode]

  Taro.setNavigationBarColor({
    frontColor: nav.frontColor,
    backgroundColor: nav.backgroundColor,
    animation: { duration: 180, timingFunc: 'easeIn' },
  }).catch(() => {})

  Taro.setTabBarStyle({
    color: tab.color,
    selectedColor: tab.selectedColor,
    backgroundColor: tab.backgroundColor,
    borderStyle: tab.borderStyle,
  }).catch(() => {})
}

export function getThemeClassName(mode: ThemeMode): string {
  return mode === 'night' ? 'theme-night' : 'theme-day'
}
