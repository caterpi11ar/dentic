import type { DashboardMember, FamilyDashboard } from '@/services/api/familyApi'
import { Text, View } from '@tarojs/components'
import Taro, { useDidShow, useShareAppMessage } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import AvatarImage from '@/components/AvatarImage'
import Calendar from '@/components/Calendar'
import InPageTabBar from '@/components/InPageTabBar'
import PageLayout from '@/components/PageLayout'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import { getBusinessAnchorDate, getBusinessDate } from '@/services/dateBoundary'
import { applyLightThemeToChrome } from '@/services/theme'
import { familyStore, useFamilyStore } from '@/stores/family'

const INTERACTION_LABELS: Record<string, string> = {
  like: '鼓励',
  reminder: '提醒刷牙',
}

type FamilyTab = 'overview' | 'members' | 'interactions'

const TAB_OPTIONS: Array<{ value: FamilyTab, label: string }> = [
  { value: 'overview', label: '看板' },
  { value: 'members', label: '成员' },
  { value: 'interactions', label: '互动' },
]

const MAX_VISIBLE_AVATARS = 3

/** 头像堆叠组件 */
function AvatarStack({
  members,
  expanded,
  onToggle,
}: {
  members: DashboardMember[]
  expanded: boolean
  onToggle: () => void
}) {
  const visible = expanded ? members : members.slice(0, MAX_VISIBLE_AVATARS)
  const overflow = members.length - MAX_VISIBLE_AVATARS

  return (
    <View className="flex items-center">
      {/* 堆叠头像 */}
      <View className="flex items-center">
        {visible.map((m, i) => (
          <View
            key={m.openId}
            className="size-9 rounded-full bg-primary-light border-2 border-surface-white flex items-center justify-center overflow-hidden flex-shrink-0"
            style={i > 0 ? { marginLeft: '-8px' } : undefined}
          >
            {m.avatar
              ? <AvatarImage src={m.avatar} className="size-9 rounded-full" mode="aspectFill" />
              : (
                  <Text className="text-label-xs font-heading font-semibold text-primary">
                    {m.nickname.slice(0, 1)}
                  </Text>
                )}
          </View>
        ))}
        {!expanded && overflow > 0 && (
          <View
            className="size-9 rounded-full bg-line border-2 border-surface-white flex items-center justify-center flex-shrink-0"
            style={{ marginLeft: '-8px' }}
            role="button"
            onClick={onToggle}
          >
            <Text className="text-label-xs font-body font-semibold text-content-secondary">
              +
              {overflow}
            </Text>
          </View>
        )}
      </View>
      {/* 名字列表 */}
      <View className="ml-2.5 flex-1 min-w-0">
        {expanded
          ? (
              <View className="flex flex-wrap gap-1">
                {members.map(m => (
                  <Text key={m.openId} className="text-label-xs font-body text-content-secondary">
                    {m.nickname}
                  </Text>
                ))}
              </View>
            )
          : (
              <Text className="text-paragraph-sm font-body text-content-secondary">
                {members.length}
                人
              </Text>
            )}
      </View>
    </View>
  )
}

/** 看板分组卡片 */
function StatusGroup({
  label,
  variant,
  members,
  expanded,
  onToggle,
}: {
  label: string
  variant: 'success' | 'warning' | 'default'
  members: DashboardMember[]
  expanded: boolean
  onToggle: () => void
}) {
  if (members.length === 0)
    return null

  const borderClass = variant === 'success'
    ? 'border-success/20'
    : variant === 'warning'
      ? 'border-warning/20'
      : 'border-line'

  const labelClass = variant === 'success'
    ? 'text-success'
    : variant === 'warning'
      ? 'text-warning'
      : 'text-content-tertiary'

  return (
    <View className={`rounded-anthropic border ${borderClass} bg-surface-white/80 px-4 py-3.5`}>
      <Text className={`text-label-sm font-heading font-semibold ${labelClass} mb-2.5 block`}>
        {label}
      </Text>
      <AvatarStack members={members} expanded={expanded} onToggle={onToggle} />
    </View>
  )
}

/** 看板 Tab */
function OverviewTab({ dashboard }: { dashboard: FamilyDashboard }) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)

  const now = new Date()
  const businessToday = getBusinessAnchorDate(now)
  const todayStr = getBusinessDate(now)
  const [calYear, setCalYear] = useState(businessToday.getFullYear())
  const [calMonth, setCalMonth] = useState(businessToday.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // 合并所有成员的 weekDays 构建 daySessionMap
  const daySessionMap = useMemo(() => {
    const map = new Map<string, { morning: boolean, evening: boolean }>()
    for (const member of dashboard.members) {
      for (const day of member.weekDays) {
        const entry = map.get(day.date) ?? { morning: false, evening: false }
        if (day.morningDone)
          entry.morning = true
        if (day.eveningDone)
          entry.evening = true
        map.set(day.date, entry)
      }
    }
    return map
  }, [dashboard.members])

  // 选中日期的逐成员状态
  const selectedDayMembers = useMemo(() => {
    if (!selectedDate)
      return null
    return dashboard.members.map((m) => {
      const day = m.weekDays.find(d => d.date === selectedDate)
      return {
        ...m,
        morningDone: day?.morningDone ?? false,
        eveningDone: day?.eveningDone ?? false,
      }
    })
  }, [selectedDate, dashboard.members])

  const handlePrevMonth = () => {
    setSelectedDate(null)
    setExpandedGroup(null)
    if (calMonth === 1) {
      setCalYear(prev => prev - 1)
      setCalMonth(12)
      return
    }
    setCalMonth(prev => prev - 1)
  }

  const handleNextMonth = () => {
    setSelectedDate(null)
    setExpandedGroup(null)
    if (calMonth === 12) {
      setCalYear(prev => prev + 1)
      setCalMonth(1)
      return
    }
    setCalMonth(prev => prev + 1)
  }

  const handleSelectDate = (date: string) => {
    setSelectedDate(date)
    setExpandedGroup(null)
  }

  // 格式化选中日期显示
  const selectedDateLabel = useMemo(() => {
    if (!selectedDate)
      return ''
    const parts = selectedDate.split('-').map(Number)
    return `${parts[1]}月${parts[2]}日`
  }, [selectedDate])

  return (
    <View className="mt-6">
      {/* 家庭连续天数 */}
      <View className="flex items-baseline gap-2 mb-6">
        <Text className="text-label-sm font-body font-semibold tracking-wide text-content-tertiary uppercase">
          家庭连续
        </Text>
        <Text className="text-display-md leading-none font-heading font-medium tabular-nums text-primary">
          {dashboard.streak}
        </Text>
        <Text className="text-label-sm font-body font-semibold tracking-wide text-content-tertiary uppercase">
          天
        </Text>
      </View>

      {/* 日历 */}
      <Calendar
        year={calYear}
        month={calMonth}
        todayStr={todayStr}
        selectedDate={selectedDate}
        daySessionMap={daySessionMap}
        monthBrushed={daySessionMap.size}
        streak={dashboard.streak}
        totalDays={0}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onSelectDate={handleSelectDate}
        hideStats
      />

      {/* 选中日期 → 头像堆叠分组 */}
      {selectedDate && selectedDayMembers && (
        <View className="mt-4">
          <Text className="text-label-sm font-heading font-semibold text-content-secondary mb-3 block">
            {selectedDateLabel}
            {' '}
            完成情况
          </Text>
          <View className="flex flex-col gap-3">
            <StatusGroup
              label="已完成"
              variant="success"
              members={selectedDayMembers.filter(m => m.morningDone && m.eveningDone)}
              expanded={expandedGroup === 'done'}
              onToggle={() => setExpandedGroup(expandedGroup === 'done' ? null : 'done')}
            />
            <StatusGroup
              label="待完成"
              variant="default"
              members={selectedDayMembers.filter(m => !m.morningDone || !m.eveningDone)}
              expanded={expandedGroup === 'pending'}
              onToggle={() => setExpandedGroup(expandedGroup === 'pending' ? null : 'pending')}
            />
          </View>
        </View>
      )}

      {!selectedDate && (
        <View className="mt-4 flex justify-center">
          <Text className="text-paragraph-sm text-content-tertiary">点击日期查看成员完成情况</Text>
        </View>
      )}
    </View>
  )
}

export default function FamilyPage() {
  const family = useFamilyStore(s => s.family)
  const dashboard = useFamilyStore(s => s.dashboard)
  const interactions = useFamilyStore(s => s.interactions)
  const loading = useFamilyStore(s => s.loading)
  const fetchFamily = useFamilyStore(s => s.fetchFamily)
  const fetchDashboard = useFamilyStore(s => s.fetchDashboard)
  const fetchInteractions = useFamilyStore(s => s.fetchInteractions)

  const [activeTab, setActiveTab] = useState<FamilyTab>('overview')
  const [interactionCooldown, setInteractionCooldown] = useState(false)

  useDidShow(() => {
    applyLightThemeToChrome()
    fetchFamily().then((info) => {
      if (info) {
        fetchDashboard()
        fetchInteractions()
      }
    }).catch(() => undefined)
  })

  useShareAppMessage(() => {
    if (!family)
      return { title: '今天刷牙了吗' }
    return {
      title: `邀请你加入「${family.name}」，一起关注刷牙`,
      path: `/pages/family/join?familyId=${family.familyId}`,
    }
  })

  const handleInteraction = (type: 'like' | 'reminder') => {
    if (interactionCooldown) {
      Taro.showToast({ title: '操作太频繁，请稍后再试', icon: 'none' }).catch(() => undefined)
      return
    }
    setInteractionCooldown(true)
    setTimeout(setInteractionCooldown, 5000, false)

    familyStore.getState().sendInteraction(type).then(() => {
      const label = type === 'reminder' ? '已发送提醒' : '已发送鼓励'
      Taro.showToast({ title: label, icon: 'success', duration: 1000 }).catch(() => undefined)
    }).catch((err) => {
      const msg = (err as Error)?.message || '发送失败'
      Taro.showToast({ title: msg, icon: 'none' }).catch(() => undefined)
    })
  }

  // ── 未加入家庭 ──
  if (!family && !loading) {
    return (
      <PageLayout scroll>
        <Text className="text-display-md font-heading font-medium tracking-tight text-content">
          家庭
        </Text>

        <View className="mt-16 flex flex-col items-center gap-6">
          <View className="size-16 rounded-full bg-primary-light flex items-center justify-center">
            <Text className="text-display-md font-heading text-primary">家</Text>
          </View>
          <Text className="text-paragraph-md font-heading text-content-secondary text-center leading-relaxed px-4">
            创建家庭后，可以邀请家人一起
            {'\n'}
            关注孩子的刷牙情况
          </Text>
          <Button
            onClick={() => Taro.redirectTo({ url: '/pages/family/create' }).catch(() => undefined)}
            aria-label="创建我的家"
          >
            创建我的家
          </Button>
        </View>

        <InPageTabBar current="family" />
      </PageLayout>
    )
  }

  // ── 加载中 ──
  if (loading && !family) {
    return (
      <PageLayout scroll>
        <Text className="text-display-md font-heading font-medium tracking-tight text-content">
          家庭
        </Text>
        <View className="mt-16 flex justify-center">
          <Text className="text-paragraph-sm text-content-tertiary">加载中...</Text>
        </View>
        <InPageTabBar current="family" />
      </PageLayout>
    )
  }

  // ── 已有家庭 ──
  return (
    <PageLayout scroll>
      {/* 标题 */}
      <Text className="text-display-md font-heading font-medium tracking-tight text-content">
        {family!.name}
      </Text>

      {/* Tab 切换 */}
      <View className="mt-6">
        <Tabs value={activeTab} options={TAB_OPTIONS} onValueChange={setActiveTab} className="w-full" />
      </View>

      {/* ── Tab: 看板 ── */}
      {activeTab === 'overview' && dashboard && (
        <OverviewTab dashboard={dashboard} />
      )}

      {activeTab === 'overview' && !dashboard && (
        <View className="mt-10 flex justify-center">
          <Text className="text-paragraph-sm text-content-tertiary">加载看板数据中...</Text>
        </View>
      )}

      {/* ── Tab: 成员 ── */}
      {activeTab === 'members' && (
        <View className="mt-6">
          <View className="flex flex-col gap-3">
            {family!.members.map(member => (
              <View key={member.openId} className="flex items-center gap-3 rounded-anthropic border border-line bg-surface-white/80 px-4 py-3.5">
                <View className="size-10 rounded-full bg-primary-light flex items-center justify-center overflow-hidden flex-shrink-0">
                  {member.avatar ? (
                    <AvatarImage src={member.avatar} className="size-10 rounded-full" mode="aspectFill" />
                  ) : (
                    <Text className="text-paragraph-sm font-heading font-semibold text-primary">
                      {member.nickname.slice(0, 1)}
                    </Text>
                  )}
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="text-paragraph-sm font-heading font-semibold text-content truncate block">
                    {member.nickname}
                  </Text>
                  <Text className="text-label-xs font-body text-content-tertiary mt-0.5 block">
                    {member.role === 'creator' ? '创建者' : '成员'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {family!.members.length < 2 && (
            <View className="mt-6">
              <Button
                openType="share"
                aria-label="邀请家人加入"
              >
                邀请家人加入
              </Button>
            </View>
          )}

          {/* 退出家庭 */}
          <View className="mt-4">
            <Button
              variant="danger"
              onClick={() => {
                const isCreator = family!.myRole === 'creator'
                const msg = isCreator ? '你是创建者，退出将解散家庭，所有成员都会被移除。确认退出？' : '确认退出该家庭？'
                Taro.showModal({
                  title: '退出家庭',
                  content: msg,
                  confirmColor: '#e54d42',
                }).then((res) => {
                  if (res.confirm) {
                    familyStore.getState().leaveFamily().then(() => {
                      Taro.showToast({ title: '已退出家庭', icon: 'success' }).catch(() => undefined)
                    }).catch(() => {
                      Taro.showToast({ title: '退出失败', icon: 'none' }).catch(() => undefined)
                    })
                  }
                })
              }}
              aria-label="退出家庭"
            >
              退出家庭
            </Button>
          </View>
        </View>
      )}

      {/* ── Tab: 互动 ── */}
      {activeTab === 'interactions' && (
        <View className="mt-6">
          <View className="flex gap-3">
            <View
              className="flex-1 rounded-anthropic border border-line bg-surface-white/80 py-4 flex flex-col items-center gap-1.5 active:opacity-80"
              role="button"
              onClick={() => handleInteraction('like')}
              aria-label="鼓励"
            >
              <View className="size-10 rounded-full bg-success-light flex items-center justify-center">
                <Text className="text-paragraph-md font-heading font-semibold text-success">赞</Text>
              </View>
              <Text className="text-label-xs font-body text-content-secondary">鼓励</Text>
            </View>
            <View
              className="flex-1 rounded-anthropic border border-line bg-surface-white/80 py-4 flex flex-col items-center gap-1.5 active:opacity-80"
              role="button"
              onClick={() => handleInteraction('reminder')}
              aria-label="提醒刷牙"
            >
              <View className="size-10 rounded-full bg-warning-light flex items-center justify-center">
                <Text className="text-paragraph-md font-heading font-semibold text-warning">!</Text>
              </View>
              <Text className="text-label-xs font-body text-content-secondary">提醒刷牙</Text>
            </View>
          </View>

          {interactions.length > 0 ? (
            <View className="mt-6">
              <Text className="text-label-sm font-heading font-semibold text-content-secondary mb-3 block">
                今日动态
              </Text>
              {/* 时间轴 */}
              <View className="relative pl-5">
                {/* 竖线 */}
                <View className="absolute left-[7px] top-2 bottom-2 w-px bg-line" />
                <View className="flex flex-col gap-4">
                  {interactions.map((item) => {
                    const time = new Date(item.createdAt)
                    const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
                    return (
                      <View key={item.id} className="relative flex items-start gap-3">
                        {/* 圆点 */}
                        <View className="absolute -left-5 top-1.5 size-[15px] rounded-full border-2 border-surface-white bg-primary" />
                        <View className="flex-1 min-w-0">
                          <Text className="text-paragraph-sm font-body text-content">
                            {item.fromNickname}
                            {' '}
                            发送了
                            {INTERACTION_LABELS[item.type] || item.type}
                          </Text>
                          <Text className="block mt-0.5 text-label-xs font-body text-content-disabled tabular-nums">
                            {timeStr}
                          </Text>
                        </View>
                      </View>
                    )
                  })}
                </View>
              </View>
            </View>
          ) : (
            <View className="mt-10 flex justify-center">
              <Text className="text-paragraph-sm text-content-tertiary">今天还没有互动，发个鼓励吧</Text>
            </View>
          )}
        </View>
      )}

      <InPageTabBar current="family" />
    </PageLayout>
  )
}
