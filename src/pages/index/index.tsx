import { showShareMenu, useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import InPageTabBar from '@/components/InPageTabBar'
import PageLayout from '@/components/PageLayout'
import BrushActiveState from '@/domains/brush/components/BrushActiveState'
import BrushCompletedState from '@/domains/brush/components/BrushCompletedState'
import BrushCountdownOverlay from '@/domains/brush/components/BrushCountdownOverlay'
import BrushIdleState from '@/domains/brush/components/BrushIdleState'
import { useBrushSession } from '@/domains/brush/hooks/useBrushSession'
import { formatTodayHeading, getGreeting } from '@/domains/brush/utils'
import { getNextStreakTarget } from '@/services/achievements'
import { trackEvent } from '@/services/analytics'
import { getBusinessAnchorDate } from '@/services/dateBoundary'
import { generateShareMessage } from '@/services/share'
import { applyLightThemeToChrome } from '@/services/theme'
import { familyStore } from '@/stores/family'

export default function IndexPage() {
  const {
    session,
    streak,
    newlyUnlockedIds,
    completionMessage,
    dailyTip,
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
    // 拉取家庭数据（静默，不阻塞首页）
    familyStore.getState().fetchFamily().then((info) => {
      if (info)
        familyStore.getState().fetchDashboard()
    }).catch(() => undefined)
  })

  const now = new Date()
  const businessNow = getBusinessAnchorDate(now)
  const todayHeading = formatTodayHeading(businessNow)
  const greeting = getGreeting(now.getHours())
  const nextMilestone = getNextStreakTarget(streak) ?? streak + 3
  const milestoneProgress = nextMilestone > 0 ? Math.min(100, Math.round((streak / nextMilestone) * 100)) : 0

  const isIdle = session.state === 'idle'
  const isBrushingFlow = session.state !== 'idle' && session.state !== 'completed'

  return (
    <PageLayout
      scroll={!isBrushingFlow}
      className={!isBrushingFlow ? 'flex flex-col' : undefined}
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
          newlyUnlockedIds={newlyUnlockedIds}
          dailyTip={dailyTip}
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

      <InPageTabBar current="brush" />
    </PageLayout>
  )
}
