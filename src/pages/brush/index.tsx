import { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import ToothScene from '../../components/ToothScene'
import BrushTimer from '../../components/BrushTimer'
import StepIndicator from '../../components/StepIndicator'
import {
  createSession,
  startSession,
  pauseSession,
  resumeSession,
  tick,
  skipStep,
  getCurrentStep,
  type BrushingSession,
} from '../../services/brushing'
import { getCurrentStreak, getRecordByDate, formatDate } from '../../services/storage'
import { COMPLETION_MESSAGE, MILESTONES, MILESTONE_MESSAGES } from '../../constants/brushing-steps'
import styles from './index.module.scss'

export default function BrushPage() {
  const [session, setSession] = useState<BrushingSession>(createSession)
  const [streak, setStreak] = useState(0)
  const [todayDone, setTodayDone] = useState(false)
  const [milestone, setMilestone] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useDidShow(() => {
    setStreak(getCurrentStreak())
    const today = formatDate(new Date())
    const record = getRecordByDate(today)
    setTodayDone(!!record?.completed)
  })

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleStart = () => {
    const s = startSession(createSession())
    setSession(s)
    clearTimer()
    timerRef.current = setInterval(() => {
      setSession((prev) => {
        const next = tick(prev)
        if (next.state === 'completed') {
          clearTimer()
          // 检查里程碑
          const newStreak = getCurrentStreak()
          setStreak(newStreak)
          setTodayDone(true)
          const ms = MILESTONES.find((m) => m === newStreak)
          if (ms) setMilestone(MILESTONE_MESSAGES[ms])
        }
        return next
      })
    }, 1000)
  }

  const handlePause = () => {
    if (session.state === 'brushing') {
      clearTimer()
      setSession(pauseSession(session))
    } else if (session.state === 'paused') {
      timerRef.current = setInterval(() => {
        setSession((prev) => {
          const next = tick(prev)
          if (next.state === 'completed') clearTimer()
          return next
        })
      }, 1000)
      setSession(resumeSession(session))
    }
  }

  const handleSkip = () => {
    const next = skipStep(session)
    setSession(next)
    if (next.state === 'completed') {
      clearTimer()
      setStreak(getCurrentStreak())
      setTodayDone(true)
    }
  }

  const handleReset = () => {
    clearTimer()
    setSession(createSession())
    setMilestone(null)
  }

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  // 保持屏幕常亮
  useEffect(() => {
    if (session.state === 'brushing') {
      Taro.setKeepScreenOn({ keepScreenOn: true })
    } else {
      Taro.setKeepScreenOn({ keepScreenOn: false })
    }
  }, [session.state])

  const step = getCurrentStep(session)

  return (
    <View className={styles.page}>
      {/* 顶部状态 */}
      <View className={styles.statusBar}>
        <View className={styles.streakBadge}>
          <Text>{streak > 0 ? `${streak}天连续` : '开始打卡'}</Text>
        </View>
        <Text className={todayDone ? styles.todayStatus : styles.todayStatusPending}>
          {todayDone ? '今日已刷' : '今日未刷'}
        </Text>
      </View>

      {session.state === 'completed' ? (
        /* 完成页面 */
        <View className={styles.completedOverlay}>
          <Text className={styles.completedIcon}>✓</Text>
          <Text className={styles.completedTitle}>{COMPLETION_MESSAGE}</Text>
          <Text className={styles.completedSubtitle}>
            用时 {Math.floor(session.elapsedTime / 60)}分{session.elapsedTime % 60}秒
          </Text>
          {milestone && <Text className={styles.milestoneMessage}>{milestone}</Text>}
          <Button className={styles.resetBtn} onClick={handleReset}>返回</Button>
        </View>
      ) : (
        <>
          {/* 3D 牙齿场景 */}
          <View className={styles.sceneWrapper}>
            <ToothScene
              currentStepIndex={session.currentStepIndex}
              isActive={session.state === 'brushing'}
              height={500}
            />
          </View>

          {/* 控制区域 */}
          <View className={styles.controls}>
            {session.state === 'idle' ? (
              <Button className={styles.startBtn} onClick={handleStart}>
                开始刷牙
              </Button>
            ) : (
              <View className={styles.brushingControls}>
                <BrushTimer
                  seconds={session.stepTimeLeft}
                  stepDuration={session.stepDuration}
                  prompt={step.prompt}
                  stepName={step.name}
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
