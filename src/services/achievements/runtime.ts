import { achievementsStore } from '@/stores/achievements'
import { familyStore } from '@/stores/family'
import { recordsStore } from '@/stores/records'
import { evaluateAchievements } from './evaluator'

/**
 * 拉取当前 records / dashboard / cheersSent，全量评估并合并到 achievementsStore。
 * 返回本次新增解锁的 id 数组。
 */
export function evaluateAndMerge(): string[] {
  try {
    const snapshot = evaluateAchievements({
      records: recordsStore.getState().records,
      dashboard: familyStore.getState().dashboard,
      localCounters: { cheersSent: achievementsStore.getState().cheersSent },
      now: new Date(),
    })
    return achievementsStore.getState().mergeUnlocked(snapshot)
  }
  catch {
    return []
  }
}
