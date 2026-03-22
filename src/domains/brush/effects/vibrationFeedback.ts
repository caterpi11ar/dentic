import Taro from '@tarojs/taro'

function safeVibrateShort(type: 'light' | 'medium'): void {
  Taro.vibrateShort({ type }).catch(() => {})
}

export function vibrateBrushTap(): void {
  safeVibrateShort('light')
}

export function vibrateBrushStepChange(): void {
  safeVibrateShort('medium')
}

export function vibrateBrushComplete(): void {
  Taro.vibrateLong().catch(() => {})
}
