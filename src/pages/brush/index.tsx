import { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useDidShow, useShareAppMessage } from '@tarojs/taro'
import ToothScene from '../../components/ToothScene'
import ErrorBoundary from '../../components/ErrorBoundary'
import BrushTimer from '../../components/BrushTimer'
import StepIndicator from '../../components/StepIndicator'
import {
  createSession,
  startCountdown,
  tickCountdown,
  pauseSession,
  resumeSession,
  tick,
  skipStep,
  getCurrentStep,
  type BrushingSession,
} from '../../services/brushing'
import { getCurrentStreak, getRecordsByDate, formatDate, hasSeenOnboarding, markOnboardingSeen } from '../../services/storage'
import {
  getRandomCompletionMessage,
  MILESTONES,
  MILESTONE_MESSAGES,
  TOTAL_STEPS,
} from '../../constants/brushing-steps'
import { generateShareMessage } from '../../services/share'
import { playStepSound } from '../../services/audio'

function getTodayProgress(morningDone: boolean, eveningDone: boolean): number {
  return Number(morningDone) + Number(eveningDone)
}

function getPrimaryActionText(morningDone: boolean, eveningDone: boolean): string {
  if (!morningDone) return '开始晨间刷牙'
  if (!eveningDone) return '开始晚间刷牙'
  return '再刷一次'
}

function getSessionBadge(sessionName: 'morning' | 'evening', done: boolean): {
  title: string
  status: string
  tone: string
} {
  if (sessionName === 'morning') {
    return {
      title: '早上',
      status: done ? '已刷牙' : '未刷牙',
      tone: done ? 'bg-success-light text-success-text' : 'bg-amber-50 text-amber-700',
    }
  }

  return {
    title: '晚上',
    status: done ? '已刷牙' : '未刷牙',
    tone: done ? 'bg-success-light text-success-text' : 'bg-slate-100 text-slate-600',
  }
}

export default function BrushPage() {
  const [session, setSession] = useState<BrushingSession>(createSession)
  const [streak, setStreak] = useState(0)
  const [morningDone, setMorningDone] = useState(false)
  const [eveningDone, setEveningDone] = useState(false)
  const [milestone, setMilestone] = useState<string | null>(null)
  const [completionMessage, setCompletionMessage] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refreshTodayStatus = useCallback(() => {
    const today = formatDate(new Date())
    const todayRecords = getRecordsByDate(today)
    setMorningDone(todayRecords.some((r) => r.session === 'morning' && r.completed))
    setEveningDone(todayRecords.some((r) => r.session === 'evening' && r.completed))
  }, [])

  useDidShow(() => {
    setStreak(getCurrentStreak())
    refreshTodayStatus()

    if (!hasSeenOnboarding()) {
      Taro.showModal({
        title: '欢迎使用刷了吗',
        content:
          '本应用基于巴氏（Bass）刷牙法，将口腔分为15个区域，每个区域停留约10秒。牙刷45度角对准牙龈线，小幅水平震颤，科学刷牙从今天开始！',
        showCancel: false,
        confirmText: '开始使用',
      })
      markOnboardingSeen()
    }
  })

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleStart = () => {
    Taro.vibrateShort({ type: 'light' }).catch(() => {})
    const s = startCountdown(createSession())
    setSession(s)
    clearTimer()
    timerRef.current = setInterval(() => {
      setSession((prev) => {
        if (prev.state === 'countdown') {
          const next = tickCountdown(prev)
          if (next.state === 'brushing') {
            return next
          }
          return next
        }
        return tick(prev)
      })
    }, 1000)
  }

  const handlePause = () => {
    Taro.vibrateShort({ type: 'light' }).catch(() => {})
    if (session.state === 'brushing') {
      clearTimer()
      setSession(pauseSession(session))
    } else if (session.state === 'paused') {
      clearTimer()
      timerRef.current = setInterval(() => {
        setSession((prev) => tick(prev))
      }, 1000)
      setSession(resumeSession(session))
    }
  }

  const handleSkip = () => {
    Taro.vibrateShort({ type: 'light' }).catch(() => {})
    setSession(skipStep(session))
  }

  const handleReset = () => {
    clearTimer()
    setSession(createSession())
    setMilestone(null)
  }

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  useEffect(() => {
    if (session.state === 'brushing' && session.currentStepIndex > 0) {
      Taro.vibrateShort({ type: 'medium' }).catch(() => {})
      playStepSound()
    }
  }, [session.currentStepIndex, session.state])

  useEffect(() => {
    if (session.state === 'completed') {
      clearTimer()
      Taro.vibrateLong().catch(() => {})
      setCompletionMessage(getRandomCompletionMessage())
      const newStreak = getCurrentStreak()
      setStreak(newStreak)
      refreshTodayStatus()
      const ms = MILESTONES.find((m) => m === newStreak)
      if (ms) setMilestone(MILESTONE_MESSAGES[ms])
    }
  }, [session.state, clearTimer, refreshTodayStatus])

  useShareAppMessage(() => generateShareMessage({ streak }))

  useEffect(() => {
    if (session.state === 'brushing' || session.state === 'countdown') {
      Taro.setKeepScreenOn({ keepScreenOn: true })
    } else {
      Taro.setKeepScreenOn({ keepScreenOn: false })
    }
  }, [session.state])

  const step = getCurrentStep(session)
  const todayProgress = getTodayProgress(morningDone, eveningDone)
  const primaryActionText = getPrimaryActionText(morningDone, eveningDone)
  const morningBadge = getSessionBadge('morning', morningDone)
  const eveningBadge = getSessionBadge('evening', eveningDone)

  return (
    <View className="min-h-screen flex flex-col bg-surface">
      {/* 倒计时覆盖层 */}
      {session.state === 'countdown' && (
        <View className="fixed inset-0 flex items-center justify-center bg-black/60 z-[100]" aria-live="assertive">
          <Text key={session.countdownRemaining} className="text-countdown font-bold text-surface-white animate-countdown-pulse motion-reduce:animate-none">
            {session.countdownRemaining}
          </Text>
        </View>
      )}

      {session.state === 'completed' ? (
        /* 完成页面 */
        <View className="flex-1 flex flex-col items-center justify-center px-5 py-8">
          <View className="w-full bg-surface-white rounded-2xl p-6 shadow-card-lg animate-fade-scale-in motion-reduce:animate-none">
            <View className="flex flex-col items-center">
              <View className="size-16 rounded-full bg-gradient-to-br from-success to-success-dark flex items-center justify-center mb-4 animate-bounce-slow motion-reduce:animate-none">
                <Text className="text-5xl text-surface-white">✓</Text>
              </View>
              <Text className="text-xl font-bold text-content mb-1 text-center">{completionMessage}</Text>
              {milestone && <Text className="text-base text-warning font-bold mt-1">{milestone}</Text>}
            </View>

            <View className="flex justify-around py-4 mt-4 bg-surface rounded-xl">
              <View className="flex flex-col items-center">
                <Text className="text-2xl font-bold text-primary tabular-nums">
                  {Math.floor(session.elapsedTime / 60)}:
                  {String(session.elapsedTime % 60).padStart(2, '0')}
                </Text>
                <Text className="text-xs text-content-secondary mt-1">总用时</Text>
              </View>
              <View className="flex flex-col items-center">
                <Text className="text-2xl font-bold text-success tabular-nums">{TOTAL_STEPS}</Text>
                <Text className="text-xs text-content-secondary mt-1">步骤数</Text>
              </View>
              <View className="flex flex-col items-center">
                <Text className="text-2xl font-bold text-warning tabular-nums">{streak}</Text>
                <Text className="text-xs text-content-secondary mt-1">连续天数</Text>
              </View>
            </View>

            <View className="flex gap-3 mt-5">
              <Button className="flex-1 h-11 rounded-xl bg-gradient-to-br from-success to-success-dark text-surface-white text-base font-medium border-none flex items-center justify-center active:scale-[0.97]" openType="share" aria-label="分享刷牙成绩">
                分享
              </Button>
              <Button className="flex-1 h-11 rounded-xl bg-surface text-content-tertiary text-base font-medium border-none flex items-center justify-center active:scale-[0.97]" onClick={handleReset} aria-label="返回首页">
                返回
              </Button>
            </View>
          </View>
        </View>
      ) : (
        <>
          {/* 顶部状态栏 */}
          <View className="px-4 pt-3 pb-2" role="status" aria-live="polite">
            {session.state === 'idle' && (
              <View className="bg-surface-white rounded-2xl p-4 shadow-card">
                <View className="rounded-2xl bg-surface px-4 py-3">
                  <View className="flex items-center justify-between gap-4">
                    <View>
                      <Text className="text-xs text-content-secondary">完成进度</Text>
                      <Text className="mt-1 block text-2xl font-bold text-primary tabular-nums">
                        {todayProgress}/2
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs text-content-secondary">
                        {todayProgress === 2 ? '今日达标' : '还差 ' + (2 - todayProgress) + ' 次'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="mt-4 grid grid-cols-2 gap-3">
                  <View className="rounded-2xl border border-solid border-border bg-surface px-4 py-3">
                    <View className="flex items-center justify-between">
                      <Text className="text-sm font-semibold text-content">{morningBadge.title}</Text>
                      <View className={`rounded-full px-2.5 py-1 text-xs font-medium ${morningBadge.tone}`}>
                        <Text>{morningBadge.status}</Text>
                      </View>
                    </View>
                    <Text className="mt-2 text-sm text-content-secondary">
                      {morningDone ? '晨间护理已完成。' : '建议起床后尽快完成。'}
                    </Text>
                  </View>

                  <View className="rounded-2xl border border-solid border-border bg-surface px-4 py-3">
                    <View className="flex items-center justify-between">
                      <Text className="text-sm font-semibold text-content">{eveningBadge.title}</Text>
                      <View className={`rounded-full px-2.5 py-1 text-xs font-medium ${eveningBadge.tone}`}>
                        <Text>{eveningBadge.status}</Text>
                      </View>
                    </View>
                    <Text className="mt-2 text-sm text-content-secondary">
                      {eveningDone ? '睡前护理已完成。' : '建议睡前再认真刷一次。'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* 3D 牙齿场景 */}
          <View className="flex-1 px-4 py-1">
            <View className="rounded-2xl overflow-hidden shadow-card">
              <ErrorBoundary>
                <ToothScene
                  currentStepIndex={session.currentStepIndex}
                  isActive={session.state === 'brushing'}
                  height={500}
                />
              </ErrorBoundary>
            </View>
          </View>

          {/* 控制区域 */}
          <View className="px-4 pt-2 pb-4">
            {session.state === 'idle' || session.state === 'countdown' ? (
              <Button
                className="w-full h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-surface-white text-lg font-bold flex items-center justify-center border-none active:scale-[0.97]"
                onClick={handleStart}
                disabled={session.state === 'countdown'}
              >
                {primaryActionText}
              </Button>
            ) : (
              <View className="flex flex-col items-center gap-2 animate-slide-up motion-reduce:animate-none">
                <BrushTimer
                  seconds={session.stepTimeLeft}
                  stepDuration={session.stepDuration}
                />
                {/* 提示文字 callout */}
                <View className="w-full bg-surface-white rounded-xl px-4 py-3 shadow-card border-l-4 border-solid border-primary">
                  <Text className="text-sm text-content leading-relaxed">{step.prompt}</Text>
                </View>
                <StepIndicator currentStep={session.currentStepIndex} />
                <View className="flex gap-3 w-full">
                  <Button className="flex-1 h-10 rounded-xl bg-surface-white text-primary text-base font-medium border-2 border-solid border-primary flex items-center justify-center active:scale-[0.97]" onClick={handlePause}>
                    {session.state === 'paused' ? '继续' : '暂停'}
                  </Button>
                  <Button className="flex-1 h-10 rounded-xl bg-transparent text-content-secondary text-sm border-none flex items-center justify-center active:scale-[0.97]" onClick={handleSkip}>
                    跳过此步 ›
                  </Button>
                </View>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  )
}
