import { useEffect, useState } from 'react'
import { useDidShow } from '@tarojs/taro'
import { useInterval, useMemoizedFn } from 'ahooks'
import {
  applyThemeToChrome,
  getThemeChangeBoundary,
  resolveThemeMode,
  type ThemeMode,
} from '../services/theme'
import { getSettings } from '../services/settingsStorage'

interface TimeThemeState {
  themeMode: ThemeMode
  isNight: boolean
  nextThemeChangeAt: Date
  refreshTheme: () => void
}

export function useTimeTheme(): TimeThemeState {
  const getSnapshot = useMemoizedFn(() => {
    const now = new Date()
    const { themePreference } = getSettings()
    return {
      themeMode: resolveThemeMode(themePreference, now),
      nextThemeChangeAt: getThemeChangeBoundary(now),
    }
  })

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getSnapshot().themeMode)
  const [nextThemeChangeAt, setNextThemeChangeAt] = useState<Date>(() => getSnapshot().nextThemeChangeAt)

  const refreshTheme = useMemoizedFn(() => {
    const next = getSnapshot()
    setThemeMode(next.themeMode)
    setNextThemeChangeAt(next.nextThemeChangeAt)
  })

  useDidShow(() => {
    refreshTheme()
  })

  useEffect(() => {
    applyThemeToChrome(themeMode)
  }, [themeMode])

  useInterval(refreshTheme, 30000)

  return {
    themeMode,
    isNight: themeMode === 'night',
    nextThemeChangeAt,
    refreshTheme,
  }
}
