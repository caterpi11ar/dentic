import type { RankPeriodType } from '@/types'
import { callCloudFunction } from '@/services/api'

export interface RankItem {
  openId: string
  nickname: string
  avatar: string
  score: number
  rank: number
  isMe: boolean
}

/** 获取全站排行榜 */
export function getLeaderboard(periodType: RankPeriodType): Promise<{
  list: RankItem[]
  myRank: RankItem | null
}> {
  return callCloudFunction('rank', 'getLeaderboard', { periodType })
}
