import { View } from '@tarojs/components'
import { showShareMenu, useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import InPageTabBar from '@/components/InPageTabBar'
import PageLayout from '@/components/PageLayout'
import { cn } from '@/components/ui/cn'
import { MILESTONES } from '@/constants/brushing-steps'
import BrushActiveState from '@/domains/brush/components/BrushActiveState'
import BrushCompletedState from '@/domains/brush/components/BrushCompletedState'
import BrushCountdownOverlay from '@/domains/brush/components/BrushCountdownOverlay'
import BrushIdleState from '@/domains/brush/components/BrushIdleState'
import { useBrushSession } from '@/domains/brush/hooks/useBrushSession'
import { formatTodayHeading, getGreeting } from '@/domains/brush/utils'
import { trackEvent } from '@/services/analytics'
import { getBusinessAnchorDate } from '@/services/dateBoundary'
import { generateShareMessage } from '@/services/share'
import { applyLightThemeToChrome } from '@/services/theme'

export default function IndexPage() {
  const {
    session,
    streak,
    milestone,
    completionMessage,
    dailyStatus,
    stepPrompt,
    handleStart,
    handlePause,
    handleReset,
  } = useBrushSession()

  const shareContent = generateShareMessage({ streak })

  useShareAppMessage(() => shareContent)
  useShareTimeline(() => ({ title: shareContent.title }))
  useDidShow(() => {
    applyLightThemeToChrome()
    trackEvent('home_view')
    showShareMenu({
      withShareTicket: true,
      showShareItems: ['shareAppMessage', 'shareTimeline'],
    }).catch(() =>
      showShareMenu({
        withShareTicket: true,
      }).catch(() => undefined),
    )
  })

  const now = new Date()
  const businessNow = getBusinessAnchorDate(now)
  const todayHeading = formatTodayHeading(businessNow)
  const greeting = getGreeting(now.getHours())
  const nextMilestone = MILESTONES.find(m => m > streak) ?? streak + 3
  const milestoneProgress = nextMilestone > 0 ? Math.min(100, Math.round((streak / nextMilestone) * 100)) : 0

  const isIdle = session.state === 'idle'
  const isBrushingFlow = session.state !== 'idle' && session.state !== 'completed'
  const shouldEnableScroll = false

  return (
    <PageLayout scroll={shouldEnableScroll}>
      <View
        className={cn(
          'relative flex-1 flex flex-col',
          isBrushingFlow ? 'overflow-hidden' : '',
        )}
      >
        {session.state === 'countdown' && (
          <BrushCountdownOverlay remaining={session.countdownRemaining} />
        )}

        {isIdle && (
          <BrushIdleState
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
            dailyStatus={dailyStatus}
            onReset={handleReset}
          />
        ) : session.state !== 'idle' ? (
          <BrushActiveState
            session={session}
            stepPrompt={stepPrompt}
            onPause={handlePause}
          />
        ) : null}
      </View>

      <InPageTabBar current="brush" />
    </PageLayout>
  )
}
