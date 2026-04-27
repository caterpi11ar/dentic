import type { AchievementDef, EvaluateContext } from './definitions'
import { ACHIEVEMENTS } from './definitions'

/** 全量评估：返回当前应解锁的成就 id 集合 */
export function evaluateAchievements(ctx: EvaluateContext): Set<string> {
  const unlocked = new Set<string>()
  ACHIEVEMENTS.forEach((achievement: AchievementDef) => {
    try {
      if (achievement.unlock(ctx))
        unlocked.add(achievement.id)
    }
    catch {
      // 单条出错不影响其他评估
    }
  })
  return unlocked
}
