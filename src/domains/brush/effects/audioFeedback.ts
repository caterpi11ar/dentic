import { destroyAudio, playStepSound, playStepVoice, playVoice } from '@/services/audio'

export function playBrushStartAudio(): void {
  playVoice('start.mp3')
}

export function playBrushStepAudio(stepIndex: number): void {
  if (stepIndex > 0) {
    playStepSound()
    playStepVoice(stepIndex)
    return
  }

  playStepVoice(0)
}

export function playBrushCompleteAudio(): void {
  playVoice('complete.mp3')
}

export function destroyBrushAudio(): void {
  destroyAudio()
}
