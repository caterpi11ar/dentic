import { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow, useShareAppMessage } from '@tarojs/taro'
import ToothScene from '../../components/ToothScene'
import ErrorBoundary from '../../components/ErrorBoundary'
import BrushTimer from '../../components/BrushTimer'
import StepIndicator from '../../components/StepIndicator'
import ShadButton from '../../components/ui/ShadButton'
import { ShadCard, ShadCardContent } from '../../components/ui/ShadCard'
import { useTimeTheme } from '../../hooks/useTimeTheme'
import { getThemeClassName } from '../../services/theme'
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
import { getCurrentStreak, hasSeenOnboarding, markOnboardingSeen } from '../../services/storage'
import {
  getRandomCompletionMessage,
  MILESTONES,
  MILESTONE_MESSAGES,
  TOTAL_STEPS,
} from '../../constants/brushing-steps'
import { generateShareMessage } from '../../services/share'
import { playStepSound } from '../../services/audio'

function formatBoundaryTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export default function BrushPage() {
  const { themeMode, nextThemeChangeAt } = useTimeTheme()
  const [session, setSession] = useState<BrushingSession>(createSession)
  const [streak, setStreak] = useState(0)
  const [milestone, setMilestone] = useState<string | null>(null)
  const [completionMessage, setCompletionMessage] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useDidShow(() => {
    setStreak(getCurrentStreak())

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
          return tickCountdown(prev)
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
      const ms = MILESTONES.find((m) => m === newStreak)
      if (ms) setMilestone(MILESTONE_MESSAGES[ms])
    }
  }, [session.state, clearTimer])

  useShareAppMessage(() => generateShareMessage({ streak }))

  useEffect(() => {
    if (session.state === 'brushing' || session.state === 'countdown') {
      Taro.setKeepScreenOn({ keepScreenOn: true })
    } else {
      Taro.setKeepScreenOn({ keepScreenOn: false })
    }
  }, [session.state])

  const step = getCurrentStep(session)
  return (
    <View className={`theme-page app-scroll ${getThemeClassName(themeMode)}`}>
      <View className="relative min-h-screen px-4 pt-3 pb-3 flex flex-col">
        {session.state === 'countdown' && (
          <View className="fixed inset-0 flex items-center justify-center bg-black/65 z-[100]" aria-live="assertive">
            <Text
              key={session.countdownRemaining}
              className="text-countdown font-bold text-surface-white animate-countdown-pulse motion-reduce:animate-none"
            >
              {session.countdownRemaining}
            </Text>
          </View>
        )}

        {session.state === 'idle' && (
          <View className="flex-1 flex items-center justify-center">
            <ShadCard className="w-full rounded-[32px] bg-surface-white/95 shadow-card-lg backdrop-blur-sm">
              <ShadCardContent className="px-6 py-7">
                <View className="flex flex-col items-start gap-1">
                  <Text className="text-xs font-semibold tracking-wide text-content-secondary">今日检查</Text>
                  <Text className="text-xs text-content-tertiary">
                    {themeMode === 'day' ? '日间主题' : '夜间主题'}
                  </Text>
                </View>

                <View className="mt-5 rounded-3xl bg-gradient-to-br from-primary-light to-surface px-5 py-5 border border-line-light">
                  <Text className="text-xs text-content-secondary">连续天数</Text>
                  <Text className="mt-2 text-6xl leading-none font-black text-primary tabular-nums">{streak}</Text>
                  <Text className="mt-2 text-xs text-content-secondary">保持节奏，今天继续完成一次护理</Text>
                </View>

                <View className="mt-4 rounded-2xl bg-surface px-4 py-3 border border-line-light">
                  <Text className="text-xs text-content-tertiary">
                    下次主题切换时间 {formatBoundaryTime(nextThemeChangeAt)}
                  </Text>
                </View>

                <ShadButton
                  className="mt-5 min-h-12 text-base font-semibold"
                  onClick={handleStart}
                >
                  开始刷牙
                </ShadButton>
              </ShadCardContent>
            </ShadCard>
          </View>
        )}

        {session.state === 'completed' ? (
          <View className="flex-1 flex items-center">
            <ShadCard className="w-full rounded-3xl bg-surface-white/95 p-5 shadow-card-lg animate-fade-scale-in motion-reduce:animate-none">
              <View className="flex flex-col items-center text-center">
                <View className="size-16 rounded-full bg-gradient-to-br from-success to-success-dark flex items-center justify-center mb-4 animate-bounce-slow motion-reduce:animate-none">
                  <Text className="text-5xl text-surface-white">✓</Text>
                </View>
                <Text className="text-xl md:text-2xl leading-snug font-bold text-content max-w-[90%]">
                  {completionMessage}
                </Text>
                {milestone && (
                  <Text className="text-sm md:text-base leading-relaxed text-warning font-bold mt-2 max-w-[90%]">
                    {milestone}
                  </Text>
                )}
              </View>

              <View className="mt-4 flex flex-col gap-1.5">
                <View className="rounded-lg bg-surface border border-line-light px-3 py-2.5 min-h-10 flex items-center justify-between">
                  <Text className="text-xs text-content-secondary">总用时</Text>
                  <Text className="text-base font-bold text-primary tabular-nums">
                    {Math.floor(session.elapsedTime / 60)}:{String(session.elapsedTime % 60).padStart(2, '0')}
                  </Text>
                </View>
                <View className="rounded-lg bg-surface border border-line-light px-3 py-2.5 min-h-10 flex items-center justify-between">
                  <Text className="text-xs text-content-secondary">步骤数</Text>
                  <Text className="text-base font-bold text-success tabular-nums">{TOTAL_STEPS}</Text>
                </View>
                <View className="rounded-lg bg-surface border border-line-light px-3 py-2.5 min-h-10 flex items-center justify-between">
                  <Text className="text-xs text-content-secondary">连续天数</Text>
                  <Text className="text-base font-bold text-warning tabular-nums">{streak}</Text>
                </View>
              </View>

              <View className="mt-4 flex flex-col gap-2">
                <ShadButton
                  className="min-h-11 text-base"
                  openType="share"
                  aria-label="分享刷牙成绩"
                >
                  分享
                </ShadButton>
                <ShadButton
                  variant="secondary"
                  className="min-h-11 text-base"
                  onClick={handleReset}
                  aria-label="返回首页"
                >
                  返回
                </ShadButton>
              </View>
            </ShadCard>
          </View>
        ) : session.state !== 'idle' ? (
          <View className="flex-1 min-h-0 flex flex-col gap-2 mt-2">
            <ShadCard className="rounded-3xl bg-surface-white/95 shadow-card-lg flex-1 min-h-[270px] overflow-hidden">
              <View className="px-4 pt-2">
                <Text className="text-xs text-content-secondary">牙齿区域引导</Text>
              </View>
              <View className="px-2 pb-1 pt-0">
                <ErrorBoundary>
                  <ToothScene
                    currentStepIndex={session.currentStepIndex}
                    isActive={session.state === 'brushing'}
                    compact
                  />
                </ErrorBoundary>
              </View>
            </ShadCard>

            <ShadCard className="rounded-3xl bg-surface-white/95 p-2.5 shadow-card-lg">
              <View className="flex flex-col items-center gap-2 animate-slide-up motion-reduce:animate-none">
                <BrushTimer seconds={session.stepTimeLeft} stepDuration={session.stepDuration} />
                <View className="w-full rounded-2xl border border-primary/25 bg-primary-light/55 px-4 py-3">
                  <Text className="text-sm text-content leading-relaxed">{step.prompt}</Text>
                </View>
                <StepIndicator currentStep={session.currentStepIndex} />
                <View className="flex flex-col w-full gap-2">
                  <ShadButton
                    variant="secondary"
                    className="min-h-11 text-base"
                    onClick={handlePause}
                  >
                    {session.state === 'paused' ? '继续' : '暂停'}
                  </ShadButton>
                  <ShadButton
                    variant="outline"
                    className="min-h-11"
                    onClick={handleSkip}
                  >
                    跳过此步
                  </ShadButton>
                </View>
              </View>
            </ShadCard>
          </View>
        ) : null}
      </View>
    </View>
  )
}
