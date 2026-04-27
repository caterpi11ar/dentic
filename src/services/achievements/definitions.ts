import type { FamilyDashboard } from '@/services/api/familyApi'
import type { BrushingRecord } from '@/types'
import {
  computeCurrentStreak,
  computeDualStreak,
  familyAllBrushedDaysCount,
  familyAllBrushedToday,
  hasAnyDualDay,
  totalCleanSessions,
  totalCompletedSessions,
} from './utils'

export type AchievementCategory = 'streak' | 'dual' | 'clean' | 'total' | 'family'
export type AchievementTier = 'bronze' | 'silver' | 'gold'
export type AchievementIconKey = 'streak' | 'dual' | 'clean' | 'total' | 'family' | 'cheer'

export interface EvaluateContext {
  records: BrushingRecord[]
  dashboard: FamilyDashboard | null
  localCounters: { cheersSent: number }
  now: Date
}

export interface AchievementProgress {
  current: number
  target: number
}

export interface AchievementDef {
  id: string
  category: AchievementCategory
  tier: AchievementTier
  title: string
  description: string
  /** 对应徽章 svg basename（locked / unlocked 由 UI 组装） */
  icon: AchievementIconKey
  /** 进度（可选） */
  progress?: (ctx: EvaluateContext) => AchievementProgress
  /** 是否解锁 */
  unlock: (ctx: EvaluateContext) => boolean
  /** 列表排序权重（同组内从小到大） */
  sortWeight: number
}

function streakProgress(target: number) {
  return (ctx: EvaluateContext): AchievementProgress => ({
    current: computeCurrentStreak(ctx.records, ctx.now),
    target,
  })
}

function dualStreakProgress(target: number) {
  return (ctx: EvaluateContext): AchievementProgress => ({
    current: computeDualStreak(ctx.records, ctx.now),
    target,
  })
}

function cleanProgress(target: number) {
  return (ctx: EvaluateContext): AchievementProgress => ({
    current: totalCleanSessions(ctx.records),
    target,
  })
}

function totalProgress(target: number) {
  return (ctx: EvaluateContext): AchievementProgress => ({
    current: totalCompletedSessions(ctx.records),
    target,
  })
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // ── A 持续 ──
  {
    id: 'streak_3',
    category: 'streak',
    tier: 'bronze',
    title: '三日同行',
    description: '连续刷牙 3 天',
    icon: 'streak',
    progress: streakProgress(3),
    unlock: ctx => computeCurrentStreak(ctx.records, ctx.now) >= 3,
    sortWeight: 3,
  },
  {
    id: 'streak_7',
    category: 'streak',
    tier: 'bronze',
    title: '一周坚持',
    description: '连续刷牙 7 天',
    icon: 'streak',
    progress: streakProgress(7),
    unlock: ctx => computeCurrentStreak(ctx.records, ctx.now) >= 7,
    sortWeight: 7,
  },
  {
    id: 'streak_14',
    category: 'streak',
    tier: 'silver',
    title: '两周习惯',
    description: '连续刷牙 14 天',
    icon: 'streak',
    progress: streakProgress(14),
    unlock: ctx => computeCurrentStreak(ctx.records, ctx.now) >= 14,
    sortWeight: 14,
  },
  {
    id: 'streak_30',
    category: 'streak',
    tier: 'silver',
    title: '月度恒心',
    description: '连续刷牙 30 天',
    icon: 'streak',
    progress: streakProgress(30),
    unlock: ctx => computeCurrentStreak(ctx.records, ctx.now) >= 30,
    sortWeight: 30,
  },
  {
    id: 'streak_60',
    category: 'streak',
    tier: 'silver',
    title: '两月不辍',
    description: '连续刷牙 60 天',
    icon: 'streak',
    progress: streakProgress(60),
    unlock: ctx => computeCurrentStreak(ctx.records, ctx.now) >= 60,
    sortWeight: 60,
  },
  {
    id: 'streak_100',
    category: 'streak',
    tier: 'gold',
    title: '百日筑基',
    description: '连续刷牙 100 天',
    icon: 'streak',
    progress: streakProgress(100),
    unlock: ctx => computeCurrentStreak(ctx.records, ctx.now) >= 100,
    sortWeight: 100,
  },
  {
    id: 'streak_365',
    category: 'streak',
    tier: 'gold',
    title: '年度传奇',
    description: '连续刷牙 365 天',
    icon: 'streak',
    progress: streakProgress(365),
    unlock: ctx => computeCurrentStreak(ctx.records, ctx.now) >= 365,
    sortWeight: 365,
  },

  // ── B 早晚 ──
  {
    id: 'dual_1',
    category: 'dual',
    tier: 'bronze',
    title: '早晚各一次',
    description: '同一天早晚各刷一次',
    icon: 'dual',
    unlock: ctx => hasAnyDualDay(ctx.records),
    sortWeight: 1,
  },
  {
    id: 'dual_7',
    category: 'dual',
    tier: 'silver',
    title: '七日双刷',
    description: '连续 7 天早晚都刷',
    icon: 'dual',
    progress: dualStreakProgress(7),
    unlock: ctx => computeDualStreak(ctx.records, ctx.now) >= 7,
    sortWeight: 7,
  },
  {
    id: 'dual_30',
    category: 'dual',
    tier: 'gold',
    title: '月月双刷',
    description: '连续 30 天早晚都刷',
    icon: 'dual',
    progress: dualStreakProgress(30),
    unlock: ctx => computeDualStreak(ctx.records, ctx.now) >= 30,
    sortWeight: 30,
  },

  // ── C 完整性 ──
  {
    id: 'clean_first',
    category: 'clean',
    tier: 'bronze',
    title: '一气呵成',
    description: '完整刷完一次（全程不暂停）',
    icon: 'clean',
    unlock: ctx => totalCleanSessions(ctx.records) >= 1,
    sortWeight: 1,
  },
  {
    id: 'clean_10',
    category: 'clean',
    tier: 'silver',
    title: '十次不暂停',
    description: '累计 10 次全程不暂停',
    icon: 'clean',
    progress: cleanProgress(10),
    unlock: ctx => totalCleanSessions(ctx.records) >= 10,
    sortWeight: 10,
  },
  {
    id: 'clean_50',
    category: 'clean',
    tier: 'gold',
    title: '五十次不暂停',
    description: '累计 50 次全程不暂停',
    icon: 'clean',
    progress: cleanProgress(50),
    unlock: ctx => totalCleanSessions(ctx.records) >= 50,
    sortWeight: 50,
  },

  // ── D 累计 ──
  {
    id: 'total_10',
    category: 'total',
    tier: 'bronze',
    title: '初入门径',
    description: '累计完成 10 次',
    icon: 'total',
    progress: totalProgress(10),
    unlock: ctx => totalCompletedSessions(ctx.records) >= 10,
    sortWeight: 10,
  },
  {
    id: 'total_50',
    category: 'total',
    tier: 'bronze',
    title: '五十次里程',
    description: '累计完成 50 次',
    icon: 'total',
    progress: totalProgress(50),
    unlock: ctx => totalCompletedSessions(ctx.records) >= 50,
    sortWeight: 50,
  },
  {
    id: 'total_200',
    category: 'total',
    tier: 'silver',
    title: '二百次',
    description: '累计完成 200 次',
    icon: 'total',
    progress: totalProgress(200),
    unlock: ctx => totalCompletedSessions(ctx.records) >= 200,
    sortWeight: 200,
  },
  {
    id: 'total_500',
    category: 'total',
    tier: 'gold',
    title: '五百次',
    description: '累计完成 500 次',
    icon: 'total',
    progress: totalProgress(500),
    unlock: ctx => totalCompletedSessions(ctx.records) >= 500,
    sortWeight: 500,
  },
  {
    id: 'total_1000',
    category: 'total',
    tier: 'gold',
    title: '千次之境',
    description: '累计完成 1000 次',
    icon: 'total',
    progress: totalProgress(1000),
    unlock: ctx => totalCompletedSessions(ctx.records) >= 1000,
    sortWeight: 1000,
  },

  // ── E 家庭 ──
  {
    id: 'family_same_day',
    category: 'family',
    tier: 'bronze',
    title: '齐心协力',
    description: '家庭全员同一天至少刷一次',
    icon: 'family',
    unlock: ctx => familyAllBrushedToday(ctx.dashboard),
    sortWeight: 1,
  },
  {
    id: 'family_week',
    category: 'family',
    tier: 'silver',
    title: '一周同行',
    description: '家庭全员一周每天至少一刷',
    icon: 'family',
    progress: (ctx) => {
      const current = familyAllBrushedDaysCount(ctx.dashboard)
      return { current: Math.min(current, 7), target: 7 }
    },
    unlock: ctx => familyAllBrushedDaysCount(ctx.dashboard) >= 7,
    sortWeight: 7,
  },
  {
    id: 'cheer_10',
    category: 'family',
    tier: 'silver',
    title: '互相鼓励',
    description: '累计向家人发送 10 次鼓励',
    icon: 'cheer',
    progress: ctx => ({
      current: Math.min(ctx.localCounters.cheersSent, 10),
      target: 10,
    }),
    unlock: ctx => ctx.localCounters.cheersSent >= 10,
    sortWeight: 10,
  },
]

/** 同组内按 sortWeight 升序 */
export function getAchievementsByCategory(
  category: AchievementCategory,
): AchievementDef[] {
  return ACHIEVEMENTS
    .filter(achievement => achievement.category === category)
    .sort((a, b) => a.sortWeight - b.sortWeight)
}

export function getAchievementById(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find(achievement => achievement.id === id)
}

export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
  streak: '持续',
  dual: '早晚',
  clean: '完整',
  total: '累计',
  family: '家庭',
}
