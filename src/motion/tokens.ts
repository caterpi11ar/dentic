export const MOTION_DURATION = {
  instant: 0,
  fast: 140,
  standard: 220,
  emphasized: 280,
} as const

export const MOTION_EASING = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasized: 'cubic-bezier(0.16, 1, 0.3, 1)',
  swiftOut: 'cubic-bezier(0.3, 0, 0.2, 1)',
} as const

export type MotionDurationToken = keyof typeof MOTION_DURATION
export type MotionEasingToken = keyof typeof MOTION_EASING
