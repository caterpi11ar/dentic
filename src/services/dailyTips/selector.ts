import type { DailyTip } from '@/constants/daily-tips'
import type { TipHistory } from '@/stores/achievements'
import { DAILY_TIPS } from '@/constants/daily-tips'

/** 32-bit FNV-1a hash — 用于对日期字符串做确定性散列 */
export function hashString(input: string): number {
  let hash = 0x811C9DC5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/**
 * 根据业务日期和展示历史，确定性地选出当日应展示的小贴士。
 * - 同一业务日多次进入完成态：返回 tipHistory.lastShownTipId 对应的条目
 * - 跨日：排除最近 7 条（FIFO），对剩余候选按 hash(date) 确定性挑选
 * - 若池不足（排除后为空）：回退使用全量池再 hash
 */
export function getDailyTip(date: string, history: TipHistory): DailyTip {
  if (history.lastShownDate === date && history.lastShownTipId) {
    const cached = DAILY_TIPS.find(tip => tip.id === history.lastShownTipId)
    if (cached)
      return cached
  }

  const recent = new Set(history.lastShownIds)
  const candidates = DAILY_TIPS.filter(tip => !recent.has(tip.id))
  const pool = candidates.length > 0 ? candidates : DAILY_TIPS

  const index = hashString(date) % pool.length
  return pool[index]
}
