import { callCloudFunction } from '@/services/api'

/** 区域覆盖统计 */
export interface ZoneCoverageItem {
  平均时长: number
  覆盖率: string
}

/** 健康画像数据 */
export interface HealthProfileData {
  profile: {
    区域覆盖: Record<string, ZoneCoverageItem>
    本周完成率: string
    早晚比: string
    平均用时: string
    放弃次数: number
    本周完成次数: number
    上周完成次数: number
    连续刷牙天数: number
  } | null
  summary: string | null
  hint?: string
}

/** 风险预警条目 */
export interface RiskItem {
  type: string
  severity: 'high' | 'medium' | 'low'
  message: string
}

/** 风险预警数据 */
export interface RiskCheckData {
  risks: RiskItem[]
  aiTip: string | null
}

/** 周报统计 */
export interface WeeklyReportStats {
  completionRate: string
  avgDuration: string
  totalSessions: number
  streakDays: number
}

/** AI 周报数据 */
export interface WeeklyReportData {
  report: string | null
  stats: WeeklyReportStats | null
  weekStart?: string
  generatedAt?: number
  hint?: string
}

/** 获取口腔健康画像 */
export function getHealthProfile(): Promise<HealthProfileData> {
  return callCloudFunction('ai', 'healthProfile')
}

/** 风险预警检测 */
export function checkRisks(): Promise<RiskCheckData> {
  return callCloudFunction('ai', 'riskCheck')
}

/** 获取 AI 周报 */
export function getWeeklyReport(): Promise<WeeklyReportData> {
  return callCloudFunction('ai', 'weeklyReport')
}
