import { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow, useShareAppMessage } from '@tarojs/taro'
import ToothScene from '../../components/ToothScene'
import ErrorBoundary from '../../components/ErrorBoundary'
import BrushTimer from '../../components/BrushTimer'
import StepIndicator from '../../components/StepIndicator'
import ShadButton from '../../components/ui/ShadButton'
import { ShadCard } from '../../components/ui/ShadCard'
import InPageTabBar from '../../components/InPageTabBar'
import { useTimeTheme } from '../../hooks/useTimeTheme'
import { getThemeClassName } from '../../services/theme'
import { getPageTopPadding } from '../../utils/layout'
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
import {
  getCurrentStreak,
  hasSeenOnboarding,
  markOnboardingSeen,
  formatDate,
  getRecordsByDate,
} from '../../services/storage'
import {
  getRandomCompletionMessage,
  MILESTONES,
  MILESTONE_MESSAGES,
  TOTAL_STEPS,
} from '../../constants/brushing-steps'
import { generateShareMessage } from '../../services/share'
import { playStepSound } from '../../services/audio'

function formatTodayHeading(date: Date): string {
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function getGreeting(hour: number): string {
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

type DailyStatus = {
  morningDone: boolean
  eveningDone: boolean
}

const EVENING_SESSION_START_HOUR = 18

function getTodayDailyStatus(): DailyStatus {
  const today = formatDate(new Date())
  const records = getRecordsByDate(today).filter((r) => r.completed)

  const getRecordHour = (timestamp?: number): number | null => {
    if (typeof timestamp !== 'number') return null
    const hour = new Date(timestamp).getHours()
    return Number.isNaN(hour) ? null : hour
  }

  return {
    // 兼容旧数据：以前 18:00 前可能被记成 evening，这里按晨间处理
    morningDone: records.some((r) => {
      if (r.session === 'morning') return true
      if (r.session !== 'evening') return false
      const hour = getRecordHour(r.timestamp)
      return hour !== null && hour < EVENING_SESSION_START_HOUR
    }),
    eveningDone: records.some((r) => {
      if (r.session !== 'evening') return false
      const hour = getRecordHour(r.timestamp)
      if (hour === null) return true
      return hour >= EVENING_SESSION_START_HOUR
    }),
  }
}

export default function BrushPage() {
  const { themeMode } = useTimeTheme()
  const safeTopPadding = getPageTopPadding(20)
  const [session, setSession] = useState<BrushingSession>(createSession)
  const [streak, setStreak] = useState(0)
  const [milestone, setMilestone] = useState<string | null>(null)
  const [completionMessage, setCompletionMessage] = useState('')
  const [dailyStatus, setDailyStatus] = useState<DailyStatus>({ morningDone: false, eveningDone: false })
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useDidShow(() => {
    setStreak(getCurrentStreak())
    setDailyStatus(getTodayDailyStatus())

    if (!hasSeenOnboarding()) {
      Taro.showModal({
        title: '欢迎使用刷了吗',
        content:
          '本应用基于巴氏刷牙法，将口腔分为15个区域，每个区域停留约10秒。牙刷45度角对准牙龈线，小幅水平震颤，科学刷牙从今天开始！',
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
      setDailyStatus(getTodayDailyStatus())
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

  const now = new Date()
  const todayHeading = formatTodayHeading(now)
  const greeting = getGreeting(now.getHours())
  const nextMilestone = MILESTONES.find((m) => m > streak) ?? streak + 3
  const milestoneProgress = nextMilestone > 0 ? Math.min(100, Math.round((streak / nextMilestone) * 100)) : 0
  const step = getCurrentStep(session)
  const isIdle = session.state === 'idle'
  const isBrushingFlow = session.state !== 'idle' && session.state !== 'completed'
  const shouldEnableScroll = session.state === 'completed'

  return (
    <View className={`theme-page ${shouldEnableScroll ? 'app-scroll' : ''} ${getThemeClassName(themeMode)} min-h-screen`}>
      <View
        className={`relative px-5 max-w-2xl mx-auto ${
          isIdle ? 'h-screen overflow-hidden pb-28' : isBrushingFlow ? 'h-screen overflow-hidden pb-24' : 'min-h-screen pb-32'
        }`}
        style={{ paddingTop: safeTopPadding }}
      >
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
          <View className="h-full flex flex-col gap-4">
            <View className="relative overflow-hidden rounded-xl bg-white border border-[#bccabb]/20 px-5 py-4">
              <View className="relative z-10">
                <Text className="text-sm tracking-[0.08em] text-[#006d36] font-bold">{todayHeading}</Text>
                <Text className="block mt-1.5 text-[34px] leading-none font-bold tracking-tight text-[#191c1e]">{greeting}</Text>
                <Text className="block mt-1.5 text-sm text-[#3d4a3e]">准备好继续守护你的口腔健康了吗？</Text>

                <View className="mt-4 pt-4 border-t border-[#bccabb]/25">
                  <View className="flex justify-around items-center">
                    <View
                      className={`w-12 h-12 rounded-full flex items-center justify-center relative ${
                        dailyStatus.morningDone ? 'bg-[#4ade80]/10' : 'bg-[#e5e7eb]'
                      }`}
                    >
                      <Text className="text-2xl">☀️</Text>
                      <View
                        className={`absolute -bottom-1 -right-1 rounded-full h-4 w-4 flex items-center justify-center shadow-md ${
                          dailyStatus.morningDone
                            ? 'bg-[#006d36] text-white'
                            : 'bg-[#f5f7f5] border border-[#9aa79e] text-[#9aa79e]'
                        }`}
                      >
                        <Text className="text-[10px]">{dailyStatus.morningDone ? '✓' : '○'}</Text>
                      </View>
                    </View>

                    <View className="h-6 w-[1px] bg-[#bccabb]/30" />

                    <View
                      className={`w-12 h-12 rounded-full flex items-center justify-center relative ${
                        dailyStatus.eveningDone
                          ? 'bg-[#4ade80]/10 border border-[#4ade80]/20'
                          : 'border-2 border-dashed border-[#6d7b6d]/40'
                      }`}
                    >
                      <Text className="text-2xl">🌙</Text>
                      <View
                        className={`absolute -bottom-1 -right-1 rounded-full h-4 w-4 flex items-center justify-center shadow-md ${
                          dailyStatus.eveningDone
                            ? 'bg-[#006d36] text-white'
                            : 'bg-[#f5f7f5] border border-[#9aa79e] text-[#9aa79e]'
                        }`}
                      >
                        <Text className="text-[10px]">{dailyStatus.eveningDone ? '✓' : '○'}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View className="mt-3.5 pt-3.5 border-t border-[#bccabb]/25">
                  <View className="flex items-center gap-3">
                    <View className="flex-1 min-w-0">
                      <View className="flex items-center gap-2">
                        <Text className="text-sm font-bold tracking-[0.08em] text-[#006d36]">当前连续</Text>
                        <Text className="text-base">🔥</Text>
                      </View>
                      <View className="mt-1.5 flex items-baseline gap-1">
                        <Text className="text-[40px] leading-none font-bold tracking-tighter text-[#006d36]">{streak}</Text>
                        <Text className="text-lg font-bold text-[#006d36]">天</Text>
                      </View>
                    </View>

                    <View className="flex-1 min-w-0 rounded-xl border border-[#bccabb]/30 bg-[#f3f4f6] px-3 py-2.5">
                      <Text className="text-sm font-semibold text-[#191c1e]">下个里程碑：{nextMilestone} 天</Text>
                      <View className="w-full h-1.5 bg-[#bccabb]/35 rounded-full mt-2 overflow-hidden">
                        <View className="h-full bg-[#4ade80] rounded-full" style={{ width: `${milestoneProgress}%` }} />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              <View className="absolute -right-10 -top-10 w-36 h-36 bg-[#4ade80]/20 rounded-full blur-3xl" />
            </View>

            <View className="mt-auto pb-8 flex items-center justify-center">
              <View className="relative w-full max-w-[360px]">
                <View className="absolute -inset-2 rounded-[999px] bg-[#7ddfa8]/35 blur-xl" />
                <View
                  className="relative min-h-14 px-6 py-3.5 rounded-[999px] border-2 border-[#89d9a8] bg-gradient-to-br from-[#dcf7e5] via-[#b7edca] to-[#94e2b3] shadow-xl shadow-[#198f53]/30 active:scale-95 flex items-center justify-center"
                  onClick={handleStart}
                >
                  <View className="flex items-center gap-3">
                    <Text className="text-2xl text-[#0a7f45]">🪥</Text>
                    <Text className="text-[#005f2d] text-xl font-bold">开始刷牙</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {session.state === 'completed' ? (
          <View className="pt-2">
            <ShadCard className="w-full rounded-3xl bg-surface-white/95 p-5 shadow-card-lg animate-fade-scale-in motion-reduce:animate-none">
              <View className="flex flex-col items-center text-center">
                <View className="size-16 rounded-full bg-gradient-to-br from-success to-success-dark flex items-center justify-center mb-4 animate-bounce-slow motion-reduce:animate-none">
                  <Text className="text-5xl text-surface-white">✓</Text>
                </View>
                <Text className="text-xl md:text-2xl leading-snug font-bold text-content max-w-[90%]">{completionMessage}</Text>
                {milestone && (
                  <Text className="text-sm md:text-base leading-relaxed text-warning font-bold mt-2 max-w-[90%]">{milestone}</Text>
                )}
              </View>

              <View className="mt-4 flex flex-col gap-1.5">
                <View className="rounded-lg bg-surface border border-line-light px-3 py-2.5 min-h-10 flex items-center justify-between">
                  <Text className="text-sm text-content-secondary">总用时</Text>
                  <Text className="text-base font-bold text-primary tabular-nums">
                    {Math.floor(session.elapsedTime / 60)}:{String(session.elapsedTime % 60).padStart(2, '0')}
                  </Text>
                </View>
                <View className="rounded-lg bg-surface border border-line-light px-3 py-2.5 min-h-10 flex items-center justify-between">
                  <Text className="text-sm text-content-secondary">步骤数</Text>
                  <Text className="text-base font-bold text-success tabular-nums">{TOTAL_STEPS}</Text>
                </View>
                <View className="rounded-lg bg-surface border border-line-light px-3 py-2.5 min-h-10 flex items-center justify-between">
                  <Text className="text-sm text-content-secondary">连续天数</Text>
                  <Text className="text-base font-bold text-warning tabular-nums">{streak}</Text>
                </View>
              </View>

              <View className="mt-4 flex flex-col gap-2">
                <ShadButton className="min-h-11 text-base" openType="share" aria-label="分享刷牙成绩">
                  分享
                </ShadButton>
                <ShadButton variant="secondary" className="min-h-11 text-base" onClick={handleReset} aria-label="返回首页">
                  返回
                </ShadButton>
              </View>
            </ShadCard>
          </View>
        ) : session.state !== 'idle' ? (
          <View className="h-full min-h-0 pt-1 flex flex-col gap-2 overflow-hidden">
            <View className="h-[42%] min-h-[210px] overflow-hidden">
              <View className="px-1 py-1">
                <ErrorBoundary>
                  <ToothScene
                    currentStepIndex={session.currentStepIndex}
                    isActive={session.state === 'brushing'}
                    compact
                    showStepName={false}
                  />
                </ErrorBoundary>
              </View>
            </View>

            <View className="flex-1 min-h-0 overflow-hidden px-1 pt-1">
              <View className="h-full min-h-0 flex flex-col items-center gap-1.5 animate-slide-up motion-reduce:animate-none">
                <BrushTimer seconds={session.stepTimeLeft} stepDuration={session.stepDuration} />
                <View className="w-full rounded-2xl border border-primary/25 bg-primary-light/55 px-4 py-2.5">
                  <Text className="text-base font-medium text-content leading-relaxed">{step.prompt}</Text>
                </View>
                <StepIndicator currentStep={session.currentStepIndex} />
                <View className="w-full flex gap-2 pt-1">
                  <ShadButton variant="secondary" className="min-h-10 text-base flex-1" onClick={handlePause}>
                    {session.state === 'paused' ? '继续' : '暂停'}
                  </ShadButton>
                  <ShadButton variant="secondary" className="min-h-10 text-base flex-1" onClick={handleSkip}>
                    跳过此步
                  </ShadButton>
                </View>
              </View>
            </View>
          </View>
        ) : null}
      </View>

      <InPageTabBar current="brush" />
    </View>
  )
}
