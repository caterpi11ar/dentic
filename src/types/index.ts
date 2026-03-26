/** 刷牙历史 */
export interface BrushingRecord {
  date: string // YYYY-MM-DD
  session: 'morning' | 'evening' // 早/晚
  completed: boolean
  duration: number // 实际用时（秒）
  completedSteps: number // 完成的步骤数
  timestamp: number // 完成时间戳
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
