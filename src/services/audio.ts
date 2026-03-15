import Taro from '@tarojs/taro'
import { getSettings } from './storage'

let _audioCtx: Taro.InnerAudioContext | null = null

function getAudioContext(): Taro.InnerAudioContext {
  if (!_audioCtx) {
    _audioCtx = Taro.createInnerAudioContext()
    _audioCtx.src = 'assets/audio/step-ding.mp3'
    _audioCtx.volume = 0.6
  }
  return _audioCtx
}

export function playStepSound(): void {
  const { soundEnabled } = getSettings()
  if (!soundEnabled) return
  try {
    const ctx = getAudioContext()
    ctx.stop()
    ctx.seek(0)
    ctx.play()
  } catch {
    // 静默失败
  }
}

export function destroyAudio(): void {
  if (_audioCtx) {
    _audioCtx.destroy()
    _audioCtx = null
  }
}
