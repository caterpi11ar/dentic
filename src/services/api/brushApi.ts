import type { StepDetail } from '@/types'
import { callCloudFunction } from '@/services/api'

/** 上报/更新刷牙记录 */
export function upsertBrushRecord(params: {
  bizDate: string
  session: 'morning' | 'evening'
  completed: boolean
  durationSec: number
  completedSteps: number
  source: 'local_sync' | 'direct'
  stepDetails?: StepDetail[]
  pauseCount?: number
  totalPauseDuration?: number
  abandoned?: boolean
  abandonedAtStep?: number
}): Promise<{ recordId: string }> {
  return callCloudFunction('brush', 'upsertRecord', params)
}

/** 获取指定日期刷牙状态 */
export function getDailyStatus(bizDate: string): Promise<{
  morningDone: boolean
  eveningDone: boolean
  morningTime?: number
  eveningTime?: number
}> {
  return callCloudFunction('brush', 'getDailyStatus', { bizDate })
}
