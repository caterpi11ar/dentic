import type { DailyStatus } from '@/domains/brush/utils'
import type { FamilyDashboard, FamilyInfo } from '@/services/api/familyApi'
import { Image, Text, View } from '@tarojs/components'
import iconMoon from '@/assets/icons/moon.svg'
import iconSun from '@/assets/icons/sun.svg'
import AvatarImage from '@/components/AvatarImage'
import Progress from '@/components/ui/Progress'
import StatRow from '@/components/ui/StatRow'
import { useWeather } from '@/hooks/useWeather'
import { useFamilyStore } from '@/stores/family'

function formatTime(timestamp?: number): string {
  if (typeof timestamp !== 'number')
    return '--:--'
  const d = new Date(timestamp)
  if (Number.isNaN(d.getTime()))
    return '--:--'
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

interface BrushIdleStateProps {
  todayHeading: string
  greeting: string
  streak: number
  dailyStatus: DailyStatus
  nextMilestone: number
  milestoneProgress: number
  onStart: () => void
}

/** 首页家庭进度（头像堆叠） */
function FamilyProgress({ familyInfo, dashboard }: { familyInfo: FamilyInfo, dashboard: FamilyDashboard }) {
  const done = dashboard.members.filter(m => m.today.morningDone && m.today.eveningDone)
  const pending = dashboard.members.filter(m => !m.today.morningDone || !m.today.eveningDone)

  return (
    <>
      <View className="my-5 h-px bg-line" />
      <View className="animate-fade-up-delay-3 motion-reduce:animate-none">
        <View className="flex items-center justify-between">
          <Text className="text-label-sm font-body font-semibold text-content-tertiary uppercase">
            {familyInfo.name}
          </Text>
          <View className="flex items-baseline gap-1.5">
            <Text className="text-paragraph-sm font-body font-medium tabular-nums text-primary">
              {dashboard.streak}
            </Text>
            <Text className="text-label-xs font-body text-content-tertiary">天连续</Text>
          </View>
        </View>

        {/* 已完成 */}
        {done.length > 0 && (
          <View className="mt-3 flex items-center gap-2.5">
            <Text className="text-label-xs font-body font-semibold text-success shrink-0">已完成</Text>
            <View className="flex items-center">
              {done.map((m, i) => (
                <View
                  key={m.openId}
                  className="size-7 rounded-full bg-primary-light border-2 border-surface-white flex items-center justify-center overflow-hidden flex-shrink-0"
                  style={i > 0 ? { marginLeft: '-6px' } : undefined}
                >
                  {m.avatar
                    ? <AvatarImage src={m.avatar} className="size-7 rounded-full" mode="aspectFill" />
                    : (
                        <Text className="text-[10px] font-body font-semibold text-primary">
                          {m.nickname.slice(0, 1)}
                        </Text>
                      )}
                </View>
              ))}
            </View>
            <Text className="text-label-xs font-body text-content-tertiary">
              {done.length}
              人
            </Text>
          </View>
        )}

        {/* 待完成 */}
        {pending.length > 0 && (
          <View className="mt-2 flex items-center gap-2.5">
            <Text className="text-label-xs font-body font-semibold text-content-disabled shrink-0">待完成</Text>
            <View className="flex items-center">
              {pending.map((m, i) => (
                <View
                  key={m.openId}
                  className="size-7 rounded-full bg-primary-light border-2 border-surface-white flex items-center justify-center overflow-hidden flex-shrink-0"
                  style={i > 0 ? { marginLeft: '-6px' } : undefined}
                >
                  {m.avatar
                    ? <AvatarImage src={m.avatar} className="size-7 rounded-full" mode="aspectFill" />
                    : (
                        <Text className="text-[10px] font-body font-semibold text-content-tertiary">
                          {m.nickname.slice(0, 1)}
                        </Text>
                      )}
                </View>
              ))}
            </View>
            <Text className="text-label-xs font-body text-content-tertiary">
              {pending.length}
              人
            </Text>
          </View>
        )}
      </View>
    </>
  )
}

export default function BrushIdleState({
  todayHeading,
  greeting,
  streak,
  dailyStatus,
  nextMilestone,
  milestoneProgress,
  onStart,
}: BrushIdleStateProps) {
  const { weather, loading: weatherLoading } = useWeather()

  const familyInfo = useFamilyStore(s => s.family)
  const dashboard = useFamilyStore(s => s.dashboard)
  const familyLoading = useFamilyStore(s => s.loading)

  return (
    <View className="flex-1 flex flex-col">
      {/* ── 日期 + 天气 ── */}
      <View className="pt-4 animate-fade-up motion-reduce:animate-none">
        <View className="flex items-baseline gap-3">
          <Text className="text-label-sm font-body font-semibold uppercase text-content-secondary">
            {todayHeading}
          </Text>
          {weather && (
            <Text className="text-paragraph-sm font-body font-semibold text-content-secondary">
              {weather.temp}
              °
              {weather.description}
            </Text>
          )}
          {!weather && weatherLoading && (
            <View className="h-4 w-16 rounded bg-content/[0.06] animate-pulse" />
          )}
        </View>

        <Text className="block mt-4 text-display-lg font-heading font-medium tracking-tight text-content animate-fade-up-delay-1 motion-reduce:animate-none">
          {greeting}
        </Text>
      </View>

      {/* ── 模块 A：今日状态 ── */}
      <View className="mt-5 flex gap-3 animate-fade-up-delay-2 motion-reduce:animate-none">
        {/* 早刷状态卡片 */}
        <View className="flex-1 rounded-anthropic border border-line bg-surface-white/80 px-3.5 py-3">
          <View className="flex items-center gap-2">
            <Image src={iconSun} className="size-4" mode="aspectFit" />
            <Text className="text-paragraph-sm font-body font-semibold text-content">
              晨间
            </Text>
          </View>
          {dailyStatus.morningDone ? (
            <View className="mt-1.5 flex items-center gap-1.5">
              <Text className="text-display-sm font-heading font-medium text-success tabular-nums">
                {formatTime(dailyStatus.morningTime)}
              </Text>
              <Text className="text-label-xs text-success">✓</Text>
            </View>
          ) : (
            <Text className="mt-1.5 text-paragraph-sm font-body font-medium text-content-disabled">
              待完成
            </Text>
          )}
        </View>

        {/* 晚刷状态卡片 */}
        <View className="flex-1 rounded-anthropic border border-line bg-surface-white/80 px-3.5 py-3">
          <View className="flex items-center gap-2">
            <Image src={iconMoon} className="size-4" mode="aspectFit" />
            <Text className="text-paragraph-sm font-body font-semibold text-content">
              夜间
            </Text>
          </View>
          {dailyStatus.eveningDone ? (
            <View className="mt-1.5 flex items-center gap-1.5">
              <Text className="text-display-sm font-heading font-medium text-success tabular-nums">
                {formatTime(dailyStatus.eveningTime)}
              </Text>
              <Text className="text-label-xs text-success">✓</Text>
            </View>
          ) : (
            <Text className="mt-1.5 text-paragraph-sm font-body font-medium text-content-disabled">
              待完成
            </Text>
          )}
        </View>
      </View>

      {/* ── 分割线 ── */}
      <View className="my-5 h-px bg-line" />

      {/* ── 模块 C：连续打卡 ── */}
      <View className="animate-fade-up-delay-3 motion-reduce:animate-none">
        <StatRow label="连续" value={streak} unit="天" tone="primary" align="baseline" />

        <Progress
          value={milestoneProgress}
          max={100}
          label={`下一个目标 连续 ${nextMilestone} 天`}
          className="mt-3"
        />
      </View>

      {/* ── 模块 E：家庭进度（头像堆叠） ── */}
      {familyInfo && dashboard && (
        <FamilyProgress familyInfo={familyInfo} dashboard={dashboard} />
      )}
      {familyLoading && !dashboard && (
        <>
          <View className="my-5 h-px bg-line" />
          <View className="flex items-center gap-3">
            <View className="h-4 w-20 rounded bg-content/[0.06] animate-pulse" />
            <View className="flex-1" />
            <View className="h-4 w-14 rounded bg-content/[0.06] animate-pulse" />
          </View>
          <View className="mt-3 flex items-center gap-2">
            <View className="size-7 rounded-full bg-content/[0.06] animate-pulse" />
            <View className="size-7 rounded-full bg-content/[0.06] animate-pulse" style={{ marginLeft: '-6px' }} />
            <View className="h-3 w-10 rounded bg-content/[0.06] animate-pulse ml-2" />
          </View>
        </>
      )}

      {/* ── 模块 D：开始按钮 ── */}
      <View className="mt-auto pt-4 pb-20 flex justify-center">
        <View
          className="relative flex items-center justify-center"
          role="button"
          onClick={onStart}
          aria-label="开始刷牙"
        >
          {/* 波纹扩散 */}
          <View className="absolute size-20 rounded-full bg-primary/30 animate-ripple motion-reduce:animate-none" />
          <View className="absolute size-20 rounded-full bg-primary/25 animate-ripple motion-reduce:animate-none" style={{ animationDelay: '0.7s' }} />
          <View className="absolute size-20 rounded-full bg-primary/20 animate-ripple motion-reduce:animate-none" style={{ animationDelay: '1.4s' }} />
          {/* 实心按钮 */}
          <View className="relative size-20 rounded-full bg-primary flex flex-col items-center justify-center active:scale-[0.95] transition-transform">
            <Text className="text-paragraph-md font-body font-semibold text-surface-white">刷牙</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
