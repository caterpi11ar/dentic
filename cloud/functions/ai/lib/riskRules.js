// 风险规则引擎（纯 JS 逻辑，不消耗 Token）

const RISK_TYPES = {
  ZONE_BLIND_SPOT: 'zone_blind_spot',
  HABIT_DECLINE: 'habit_decline',
  PERFUNCTORY: 'perfunctory',
  MORNING_EVENING_IMBALANCE: 'morning_evening_imbalance',
  FREQUENT_ABANDON: 'frequent_abandon',
}

/**
 * 基于画像数据检测风险
 * @param {object} profile - buildProfile() 的返回值
 * @param {Array} thisWeekRecords - 本周记录
 * @returns {Array<{type: string, severity: string, data: object, message: string}>}
 */
function detectRisks(profile, thisWeekRecords) {
  if (!profile) return []

  const risks = []

  // 1. 区域盲区：某区域覆盖率 < 70%
  if (profile.区域覆盖) {
    for (const [zoneName, stats] of Object.entries(profile.区域覆盖)) {
      const rate = parseInt(stats.覆盖率)
      if (rate < 70) {
        risks.push({
          type: RISK_TYPES.ZONE_BLIND_SPOT,
          severity: rate < 50 ? 'high' : 'medium',
          data: { zone: zoneName, coverageRate: stats.覆盖率, avgDuration: stats.平均时长 },
          message: `${zoneName}区域覆盖不足（${stats.覆盖率}），容易积累牙菌斑`,
        })
      }
    }
  }

  // 2. 习惯退化：本周完成率比上周下降 >30%
  const thisWeekCount = profile.本周完成次数 || 0
  const lastWeekCount = profile.上周完成次数 || 0
  if (lastWeekCount > 0) {
    const declineRate = Math.round(((lastWeekCount - thisWeekCount) / lastWeekCount) * 100)
    if (declineRate > 30) {
      risks.push({
        type: RISK_TYPES.HABIT_DECLINE,
        severity: declineRate > 50 ? 'high' : 'medium',
        data: { thisWeekCount, lastWeekCount, declineRate },
        message: `刷牙频率下降了${declineRate}%，口腔健康需要持续呵护`,
      })
    }
  }

  // 3. 敷衍预警：连续 3 次 duration < 120 秒
  const recentCompleted = thisWeekRecords
    .filter(r => r.completed && r.durationSec)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3)

  if (recentCompleted.length >= 3 && recentCompleted.every(r => r.durationSec < 120)) {
    risks.push({
      type: RISK_TYPES.PERFUNCTORY,
      severity: 'medium',
      data: { avgDuration: Math.round(recentCompleted.reduce((s, r) => s + r.durationSec, 0) / 3) },
      message: '最近几次刷牙时间偏短，建议每次至少 2.5 分钟',
    })
  }

  // 4. 早晚失衡：差异 > 40%
  const parts = (profile.早晚比 || '0:0').split(':').map(Number)
  const morningCount = parts[0] || 0
  const eveningCount = parts[1] || 0
  const total = morningCount + eveningCount
  if (total >= 4) {
    const imbalance = Math.abs(morningCount - eveningCount) / total
    if (imbalance > 0.4) {
      const weaker = morningCount < eveningCount ? '早间' : '晚间'
      risks.push({
        type: RISK_TYPES.MORNING_EVENING_IMBALANCE,
        severity: 'low',
        data: { morningCount, eveningCount, weaker },
        message: `${weaker}刷牙偏少，睡前清洁对防蛀尤其关键`,
      })
    }
  }

  // 5. 频繁放弃：本周 abandoned >= 3
  const abandonedCount = profile.放弃次数 || 0
  if (abandonedCount >= 3) {
    risks.push({
      type: RISK_TYPES.FREQUENT_ABANDON,
      severity: abandonedCount >= 5 ? 'high' : 'medium',
      data: { abandonedCount },
      message: `本周有${abandonedCount}次中途退出，坚持完成 15 步效果更好`,
    })
  }

  // 按严重程度排序：high > medium > low
  const severityOrder = { high: 0, medium: 1, low: 2 }
  risks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return risks
}

module.exports = { detectRisks, RISK_TYPES }
