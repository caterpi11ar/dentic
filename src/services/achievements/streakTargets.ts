const STREAK_TARGETS = [3, 7, 14, 30, 60, 100, 365]

/** 根据当前 streak 返回下一档目标（已超过最高档则返回 null） */
export function getNextStreakTarget(currentStreak: number): number | null {
  for (const target of STREAK_TARGETS) {
    if (currentStreak < target)
      return target
  }
  return null
}

export { STREAK_TARGETS }
