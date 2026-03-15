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
  getTotalTimeRemaining,
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
import styles from './index.module.scss'

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
            // countdown finished, switch to brushing tick
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

  // 步骤切换震动 + 提示音
  useEffect(() => {
    if (session.state === 'brushing' && session.currentStepIndex > 0) {
      Taro.vibrateShort({ type: 'medium' }).catch(() => {})
      playStepSound()
    }
  }, [session.currentStepIndex, session.state])

  // 完成状态的副作用
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

  // 保持屏幕常亮
  useEffect(() => {
    if (session.state === 'brushing' || session.state === 'countdown') {
      Taro.setKeepScreenOn({ keepScreenOn: true })
    } else {
      Taro.setKeepScreenOn({ keepScreenOn: false })
    }
  }, [session.state])

  const step = getCurrentStep(session)

  return (
    <View className={styles.page}>
      {/* 倒计时覆盖层 */}
      {session.state === 'countdown' && (
        <View className={styles.countdownOverlay}>
          <Text key={session.countdownRemaining} className={styles.countdownNumber}>
            {session.countdownRemaining}
          </Text>
        </View>
      )}

      {/* 顶部状态 */}
      <View className={styles.statusBar}>
        <View className={styles.streakBadge}>
          <Text>{streak > 0 ? `${streak}天连续` : '开始打卡'}</Text>
        </View>
        <View className={styles.sessionStatus}>
          <Text className={morningDone ? styles.sessionDone : styles.sessionPending}>
            早{morningDone ? ' ✓' : ''}
          </Text>
          <Text className={eveningDone ? styles.sessionDone : styles.sessionPending}>
            晚{eveningDone ? ' ✓' : ''}
          </Text>
        </View>
      </View>

      {session.state === 'completed' ? (
        /* 完成页面 */
        <View className={styles.completedOverlay}>
          <View className={styles.completedIconCircle}>
            <Text className={styles.completedCheck}>✓</Text>
          </View>
          <Text className={styles.completedTitle}>{completionMessage}</Text>
          <View className={styles.completedStats}>
            <View className={styles.completedStatItem}>
              <Text className={styles.completedStatValue}>
                {Math.floor(session.elapsedTime / 60)}:
                {String(session.elapsedTime % 60).padStart(2, '0')}
              </Text>
              <Text className={styles.completedStatLabel}>总用时</Text>
            </View>
            <View className={styles.completedStatItem}>
              <Text className={styles.completedStatValue}>{TOTAL_STEPS}</Text>
              <Text className={styles.completedStatLabel}>步骤数</Text>
            </View>
            <View className={styles.completedStatItem}>
              <Text className={styles.completedStatValue}>{streak}</Text>
              <Text className={styles.completedStatLabel}>连续天数</Text>
            </View>
          </View>
          {milestone && <Text className={styles.milestoneMessage}>{milestone}</Text>}
          <View className={styles.completedActions}>
            <Button className={styles.shareBtn} openType="share">
              分享
            </Button>
            <Button className={styles.resetBtn} onClick={handleReset}>
              返回
            </Button>
          </View>
        </View>
      ) : (
        <>
          {/* 3D 牙齿场景 */}
          <View className={styles.sceneWrapper}>
            <ErrorBoundary>
              <ToothScene
                currentStepIndex={session.currentStepIndex}
                isActive={session.state === 'brushing'}
                height={500}
              />
            </ErrorBoundary>
          </View>

          {/* 控制区域 */}
          <View className={styles.controls}>
            {session.state === 'idle' || session.state === 'countdown' ? (
              <Button className={styles.startBtn} onClick={handleStart} disabled={session.state === 'countdown'}>
                开始刷牙
              </Button>
            ) : (
              <View className={styles.brushingControls}>
                <BrushTimer
                  seconds={session.stepTimeLeft}
                  stepDuration={session.stepDuration}
                  prompt={step.prompt}
                  stepName={step.name}
                  totalRemaining={getTotalTimeRemaining(session)}
                />
                <StepIndicator currentStep={session.currentStepIndex} />
                <View className={styles.actionRow}>
                  <Button className={styles.pauseBtn} onClick={handlePause}>
                    {session.state === 'paused' ? '继续' : '暂停'}
                  </Button>
                  <Button className={styles.skipBtn} onClick={handleSkip}>
                    跳过
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
