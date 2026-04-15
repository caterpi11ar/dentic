import { MOTION_DURATION, MOTION_EASING } from './tokens'

export type MotionPresetName = 'navPress' | 'pageEnter' | 'pageExit' | 'staggerList'

export interface MotionPreset {
  duration: number
  easing: string
  delay?: number
  stagger?: number
  opacityFrom?: number
  translateY?: number
  scaleFrom?: number
}

const MOTION_PRESETS: Record<MotionPresetName, MotionPreset> = {
  navPress: {
    duration: MOTION_DURATION.fast,
    easing: MOTION_EASING.standard,
    scaleFrom: 0.96,
  },
  pageEnter: {
    duration: MOTION_DURATION.emphasized,
    easing: MOTION_EASING.emphasized,
    opacityFrom: 0.75,
    translateY: 12,
    scaleFrom: 0.995,
  },
  pageExit: {
    duration: MOTION_DURATION.fast,
    easing: MOTION_EASING.swiftOut,
    opacityFrom: 0,
  },
  staggerList: {
    duration: MOTION_DURATION.standard,
    easing: MOTION_EASING.emphasized,
    stagger: 70,
  },
}

export function getMotionPreset(name: MotionPresetName): MotionPreset {
  return MOTION_PRESETS[name]
}
