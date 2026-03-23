import { View } from '@tarojs/components'
import { showShareMenu, useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import InPageTabBar from '@/components/InPageTabBar'
import { MILESTONES } from '@/constants/brushing-steps'
import BrushActiveState from '@/domains/brush/components/BrushActiveState'
import BrushCompletedState from '@/domains/brush/components/BrushCompletedState'
import BrushCountdownOverlay from '@/domains/brush/components/BrushCountdownOverlay'
import BrushIdleState from '@/domains/brush/components/BrushIdleState'
import { useBrushSession } from '@/domains/brush/hooks/useBrushSession'
import { formatTodayHeading, getGreeting } from '@/domains/brush/utils'
import { useTimeTheme } from '@/hooks/useTimeTheme'
import { generateShareMessage } from '@/services/share'
import { getThemeClassName } from '@/services/theme'
import { getPageTopPadding } from '@/utils/layout'

export default function IndexPage() {
  const { themeMode } = useTimeTheme()
  const isNight = themeMode === 'night'
  const safeTopPadding = getPageTopPadding(20)

  const {
    session,
    streak,
    milestone,
    completionMessage,
    dailyStatus,
    stepPrompt,
    handleStart,
    handlePause,
    handleSkip,
    handleReset,
  } = useBrushSession()

  const shareContent = generateShareMessage({ streak })

  useShareAppMessage(() => shareContent)
  useShareTimeline(() => ({ title: shareContent.title }))
  useDidShow(() => {
    showShareMenu({
      withShareTicket: true,
      showShareItems: ['shareAppMessage', 'shareTimeline'],
    }).catch(() =>
      showShareMenu({
        withShareTicket: true,
      }).catch(() => undefined)
    )
  })

  const now = new Date()
  const todayHeading = formatTodayHeading(now)
  const greeting = getGreeting(now.getHours())
  const nextMilestone = MILESTONES.find((m) => m > streak) ?? streak + 3
  const milestoneProgress = nextMilestone > 0 ? Math.min(100, Math.round((streak / nextMilestone) * 100)) : 0

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
          <BrushCountdownOverlay remaining={session.countdownRemaining} isNight={isNight} />
        )}

        {isIdle && (
          <BrushIdleState
            isNight={isNight}
            todayHeading={todayHeading}
            greeting={greeting}
            streak={streak}
            dailyStatus={dailyStatus}
            nextMilestone={nextMilestone}
            milestoneProgress={milestoneProgress}
            onStart={handleStart}
          />
        )}

        {session.state === 'completed' ? (
          <BrushCompletedState
            completionMessage={completionMessage}
            milestone={milestone}
            elapsedTime={session.elapsedTime}
            streak={streak}
            onReset={handleReset}
          />
        ) : session.state !== 'idle' ? (
          <BrushActiveState
            session={session}
            stepPrompt={stepPrompt}
            onPause={handlePause}
            onSkip={handleSkip}
          />
        ) : null}
      </View>

      <InPageTabBar current="brush" />
    </View>
  )
}
