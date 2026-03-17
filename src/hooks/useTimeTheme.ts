import { useCallback, useEffect, useState } from 'react'
import { useDidShow } from '@tarojs/taro'
import {
  applyThemeToChrome,
  getThemeChangeBoundary,
  getThemeModeByDate,
  type ThemeMode,
} from '../services/theme'

interface TimeThemeState {
  themeMode: ThemeMode
  isNight: boolean
  nextThemeChangeAt: Date
}

export function useTimeTheme(): TimeThemeState {
  const getSnapshot = useCallback(() => {
    const now = new Date()
    return {
      themeMode: getThemeModeByDate(now),
      nextThemeChangeAt: getThemeChangeBoundary(now),
    }
  }, [])

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getSnapshot().themeMode)
  const [nextThemeChangeAt, setNextThemeChangeAt] = useState<Date>(() => getSnapshot().nextThemeChangeAt)

  const refreshTheme = useCallback(() => {
    const next = getSnapshot()
    setThemeMode(next.themeMode)
    setNextThemeChangeAt(next.nextThemeChangeAt)
  }, [getSnapshot])

  useDidShow(() => {
    refreshTheme()
  })

  useEffect(() => {
    applyThemeToChrome(themeMode)
  }, [themeMode])

  useEffect(() => {
    const timer = setInterval(() => {
      refreshTheme()
    }, 30000)

    return () => clearInterval(timer)
  }, [refreshTheme])

  return {
    themeMode,
    isNight: themeMode === 'night',
    nextThemeChangeAt,
  }
}
