import { BRUSHING_STEPS, TOTAL_STEPS, DEFAULT_STEP_DURATION } from '../constants/brushing-steps'
import { saveRecord, formatDate, getSettings } from './storage'
import type { BrushingState, BrushingStep } from '../types'

export interface BrushingSession {
  state: BrushingState
  currentStepIndex: number
  stepTimeLeft: number
  elapsedTime: number
  stepDuration: number
  countdownRemaining: number
}

export function createSession(): BrushingSession {
  const { stepDuration } = getSettings()
  return {
    state: 'idle',
    currentStepIndex: 0,
    stepTimeLeft: stepDuration || DEFAULT_STEP_DURATION,
    elapsedTime: 0,
    stepDuration: stepDuration || DEFAULT_STEP_DURATION,
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
    saveBrushingRecord(completed)
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
    saveBrushingRecord(completed)
    return completed
  }

  return {
    ...session,
    currentStepIndex: nextIndex,
    stepTimeLeft: session.stepDuration,
  }
}

function saveBrushingRecord(session: BrushingSession) {
  const now = new Date()
  const sessionType = now.getHours() < 14 ? 'morning' : 'evening'
  saveRecord({
    date: formatDate(now),
    session: sessionType,
    completed: true,
    duration: session.elapsedTime,
    completedSteps: TOTAL_STEPS,
    timestamp: now.getTime(),
  })
}

export function getProgress(session: BrushingSession): number {
  return (
    ((session.currentStepIndex * session.stepDuration +
      (session.stepDuration - session.stepTimeLeft)) /
      (TOTAL_STEPS * session.stepDuration)) *
    100
  )
}

/** 返回总剩余时间（秒） */
export function getTotalTimeRemaining(session: BrushingSession): number {
  const remainingSteps = TOTAL_STEPS - session.currentStepIndex - 1
  return session.stepTimeLeft + remainingSteps * session.stepDuration
}
