import type { MotionPreset } from './presets'
import Taro from '@tarojs/taro'

interface MotionGuardOptions {
  reduceMotion?: boolean
}

let cachedReduceMotion: boolean | null = null

function isH5ReduceMotionEnabled(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function isLowEndDevice(): boolean {
  try {
    const info = Taro.getSystemInfoSync() as { benchmarkLevel?: number | string }
    const benchmarkLevel = Number(info.benchmarkLevel)
    return Number.isFinite(benchmarkLevel) && benchmarkLevel > 0 && benchmarkLevel <= 20
  }
  catch {
    return false
  }
}

export function shouldReduceMotion(forceReduce?: boolean): boolean {
  if (typeof forceReduce === 'boolean')
    return forceReduce

  if (cachedReduceMotion !== null)
    return cachedReduceMotion

  cachedReduceMotion = isH5ReduceMotionEnabled() || isLowEndDevice()
  return cachedReduceMotion
}

export function withMotionGuard(preset: MotionPreset, options?: MotionGuardOptions): MotionPreset {
  if (!shouldReduceMotion(options?.reduceMotion))
    return preset

  return {
    ...preset,
    duration: 0,
    delay: 0,
    stagger: 0,
    translateY: 0,
    scaleFrom: 1,
    opacityFrom: 1,
  }
}
