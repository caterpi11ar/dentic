import type { CSSProperties } from 'react'
import { useMemo } from 'react'
import { useMotionPreset } from './useMotionPreset'

export function usePageTransition() {
  const preset = useMotionPreset('pageEnter')

  return useMemo(() => {
    if (preset.duration <= 0) {
      return {
        className: '',
        style: undefined as CSSProperties | undefined,
      }
    }

    return {
      className: 'motion-page-enter',
      style: {
        animationDuration: `${preset.duration}ms`,
        animationTimingFunction: preset.easing,
      } as CSSProperties,
    }
  }, [preset.duration, preset.easing])
}
