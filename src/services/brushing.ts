import { BRUSHING_STEPS, TOTAL_STEPS } from '@/constants/brushing-steps'
import { isMorningSessionHour } from '@/services/dateBoundary'
import type { BrushingState, BrushingStep } from '@/types'

const FIXED_STEP_DURATION_SECONDS = 10

export interface BrushingSession {
  state: BrushingState
  currentStepIndex: number
  stepTimeLeft: number
  elapsedTime: number
  stepDuration: number
  countdownRemaining: number
}

export function createSession(): BrushingSession {
  return {
    state: 'idle',
    currentStepIndex: 0,
    stepTimeLeft: FIXED_STEP_DURATION_SECONDS,
    elapsedTime: 0,
    stepDuration: FIXED_STEP_DURATION_SECONDS,
    countdownRemaining: 0,
  }
}

export function getCurrentStep(session: BrushingSession): BrushingStep {
  return BRUSHING_STEPS[session.currentStepIndex]
}

export function startCountdown(session: BrushingSession): BrushingSession {
  return { ...session, state: 'countdown', countdownRemaining: 3 }
}

export function tickCountdown(session: BrushingSession): BrushingSession {
  if (session.state !== 'countdown') return session
  const next = session.countdownRemaining - 1
  if (next <= 0) {
    return startSession({ ...session, countdownRemaining: 0 })
  }
  return { ...session, countdownRemaining: next }
}

export function startSession(session: BrushingSession): BrushingSession {
  return {
    ...session,
    state: 'brushing',
    currentStepIndex: 0,
    stepTimeLeft: session.stepDuration,
    elapsedTime: 0,
  }
}

export function pauseSession(session: BrushingSession): BrushingSession {
  return { ...session, state: 'paused' }
}

export function resumeSession(session: BrushingSession): BrushingSession {
  return { ...session, state: 'brushing' }
}

/** 每秒调用一次，返回更新后的 session */
export function tick(session: BrushingSession): BrushingSession {
  if (session.state !== 'brushing') return session

  const newTimeLeft = session.stepTimeLeft - 1
  const newElapsed = session.elapsedTime + 1

  if (newTimeLeft > 0) {
    return { ...session, stepTimeLeft: newTimeLeft, elapsedTime: newElapsed }
  }

  // 当前步骤结束，进入下一步
  const nextIndex = session.currentStepIndex + 1
  if (nextIndex >= TOTAL_STEPS) {
    // 所有步骤完成
    const completed: BrushingSession = {
      ...session,
      state: 'completed',
      stepTimeLeft: 0,
      elapsedTime: newElapsed,
      currentStepIndex: session.currentStepIndex,
    }
    return completed
  }

  return {
    ...session,
    currentStepIndex: nextIndex,
    stepTimeLeft: session.stepDuration,
    elapsedTime: newElapsed,
  }
}

/** 跳到下一步 */
export function skipStep(session: BrushingSession): BrushingSession {
  if (session.state !== 'brushing') return session

  const nextIndex = session.currentStepIndex + 1
  if (nextIndex >= TOTAL_STEPS) {
    const completed: BrushingSession = {
      ...session,
      state: 'completed',
      stepTimeLeft: 0,
      currentStepIndex: session.currentStepIndex,
    }
    return completed
  }

  return {
    ...session,
    currentStepIndex: nextIndex,
    stepTimeLeft: session.stepDuration,
  }
}

export function getSessionTypeForDate(date: Date): 'morning' | 'evening' {
  return isMorningSessionHour(date.getHours()) ? 'morning' : 'evening'
}
