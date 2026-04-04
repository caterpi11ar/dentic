import { getCurrentStreak, getTotalBrushedDays } from '@/services/recordStatsService'

interface ShareStats {
  streak: number
  totalDays: number
  elapsedTime?: number
}

export function generateShareMessage(stats?: Partial<ShareStats>): {
  title: string
  path: string
} {
  const streak = stats?.streak ?? getCurrentStreak()
  const totalDays = stats?.totalDays ?? getTotalBrushedDays()

  let title: string
  if (streak > 0) {
    title = `我已连续刷牙 ${streak} 天！来和我一起科学刷牙`
  } else if (totalDays > 0) {
    title = `我已累计刷牙 ${totalDays} 天！科学刷牙从巴氏刷牙法开始`
  } else {
    title = '今天刷牙了吗 - 科学刷牙从巴氏刷牙法开始'
  }

  return {
    title,
    path: '/pages/index/index',
  }
}
