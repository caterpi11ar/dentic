import Taro from '@tarojs/taro'
import { settingsStore } from '@/stores/settings'

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
  const { soundEnabled } = settingsStore.getState()
  if (!soundEnabled)
    return
  try {
    const ctx = getAudioContext()
    ctx.stop()
    ctx.seek(0)
    ctx.play()
  }
  catch {
    // 静默失败
  }
}

// ---- 语音播报 ----

let _voiceCtx: Taro.InnerAudioContext | null = null

function getVoiceContext(): Taro.InnerAudioContext {
  if (!_voiceCtx) {
    _voiceCtx = Taro.createInnerAudioContext()
    _voiceCtx.volume = 1.0
  }
  return _voiceCtx
}

export function playVoice(filename: string): void {
  const { voiceEnabled } = settingsStore.getState()
  if (!voiceEnabled)
    return
  try {
    const ctx = getVoiceContext()
    ctx.stop()
    ctx.src = `assets/audio/voice/${filename}`
    ctx.play()
  }
  catch {
    // 静默失败
  }
}

export function playStepVoice(stepIndex: number): void {
  const num = String(stepIndex + 1).padStart(2, '0')
  playVoice(`step-${num}.mp3`)
}

export function destroyAudio(): void {
  if (_audioCtx) {
    _audioCtx.destroy()
    _audioCtx = null
  }
  if (_voiceCtx) {
    _voiceCtx.destroy()
    _voiceCtx = null
  }
}
