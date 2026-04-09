/** 每步完成详情（用于健康画像的区域级分析） */
export interface StepDetail {
  zone: string // 区域标识，如 'upper-outer-left'
  actualDuration: number // 该步实际刷牙秒数
  skipped: boolean // 中途退出时，未到达的步骤标记为 true
}

/** 刷牙历史 */
export interface BrushingRecord {
  date: string // YYYY-MM-DD
  session: 'morning' | 'evening' // 早/晚
  completed: boolean
  duration: number // 实际用时（秒）
  completedSteps: number // 完成的步骤数
  timestamp: number // 完成时间戳
  stepDetails?: StepDetail[] // 每步区域详情
  pauseCount?: number // 暂停次数
  totalPauseDuration?: number // 总暂停时长（秒）
  abandoned?: boolean // 是否中途退出
  abandonedAtStep?: number // 在第几步退出（步骤索引）
}

/** 刷牙步骤 */
export interface BrushingStep {
  id: number
  zone: string // 区域标识
  name: string // 区域名称
  description: string // 描述
  prompt: string // 文字提示
  camera: CameraPosition // 相机位置
}

/** 相机位置 */
export interface CameraPosition {
  x: number
  y: number
  z: number
  lookAtY: number // 相机看向的 Y 偏移
}

/** 用户设置 */
export interface UserSettings {
  reminderEnabled: boolean
  reminderTime: string // HH:mm
  soundEnabled: boolean // 步骤切换提示音
  voiceEnabled: boolean // 语音播报
  rankVisibility?: RankVisibility // 排行榜可见性
  cityCode?: string | null // 城市编码
}

/** 刷牙状态 */
export type BrushingState = 'idle' | 'countdown' | 'brushing' | 'paused' | 'completed'

/** 月度统计 */
export interface MonthlyStats {
  totalDays: number
  brushedDays: number
  currentStreak: number
  longestStreak: number
}

// ==================== V1.1 排行榜与云端相关类型 ====================

/** API 统一响应 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** API 错误码 */
export enum ApiErrorCode {
  OK = 0,
  PARAM_ERROR = 4001,
  NO_PERMISSION = 4003,
  NOT_FOUND = 4004,
  CONFLICT = 4090,
  SYSTEM_ERROR = 5000,
}

/** 排行榜可见性 */
export type RankVisibility = 'public' | 'friends_only' | 'private'

/** 排行榜周期类型 */
export type RankPeriodType = 'totalDays' | 'streak'

/** 云端刷牙记录 */
export interface CloudBrushRecord {
  openId: string
  bizDate: string // YYYY-MM-DD，4:00 切日
  session: 'morning' | 'evening'
  completed: boolean
  durationSec: number
  completedSteps: number
  source: 'local_sync' | 'direct'
  createdAt: number
  stepDetails?: StepDetail[]
  pauseCount?: number
  totalPauseDuration?: number
  abandoned?: boolean
  abandonedAtStep?: number
}

/** 同步队列条目 */
export interface SyncQueueItem {
  id: string
  payload: Omit<CloudBrushRecord, 'openId' | 'createdAt'>
  retryCount: number
  createdAt: number
}
