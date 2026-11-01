import Taro from '@tarojs/taro'
import correct from '../assets/correct.wav'
import incorrect from '../assets/incorrect.wav'
import finish from '../assets/finish.mp3'
export const sounds = { correct, incorrect, finish }
let player: Taro.InnerAudioContext | undefined
export function stopSound() { try { player?.stop(); player?.destroy() } catch { /* Device capabilities must not block navigation. */ } player = undefined }
export function playSound(name: keyof typeof sounds, enabled: boolean) {
  stopSound()
  if (!enabled) return
  try {
    player = Taro.createInnerAudioContext()
    player.src = sounds[name]
    player.onError(() => { /* Audio may be unavailable; the exercise still works. */ })
    player.play()
  } catch { /* Silent fallback on unsupported environments. */ }
}