import type { MotionPresetName } from './presets'
import { useMemo } from 'react'
import { getMotionPreset } from './presets'
import { shouldReduceMotion, withMotionGuard } from './runtime'

interface UseMotionPresetOptions {
  reduceMotion?: boolean
}

export function useMotionPreset(
  name: MotionPresetName,
  options?: UseMotionPresetOptions,
) {
  const reduceMotion = shouldReduceMotion(options?.reduceMotion)

  return useMemo(
    () => withMotionGuard(getMotionPreset(name), { reduceMotion }),
    [name, reduceMotion],
  )
}
