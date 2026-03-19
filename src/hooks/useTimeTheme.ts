import { useCallback, useEffect, useState } from 'react'
import { useDidShow } from '@tarojs/taro'
import {
  applyThemeToChrome,
  getThemeChangeBoundary,
  resolveThemeMode,
  type ThemeMode,
} from '../services/theme'
import { getSettings } from '../services/storage'

interface TimeThemeState {
  themeMode: ThemeMode
  isNight: boolean
  nextThemeChangeAt: Date
}

export function useTimeTheme(): TimeThemeState {
  const getSnapshot = useCallback(() => {
    const now = new Date()
    const { themePreference } = getSettings()
    return {
      themeMode: resolveThemeMode(themePreference, now),
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
    refreshTheme,
  }
}
