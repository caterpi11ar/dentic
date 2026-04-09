// AI 周报 handler
const { buildProfile, getWeekMonday } = require('./lib/profileBuilder')
const { detectRisks } = require('./lib/riskRules')
const { getCache, setCache } = require('./lib/cache')
const { chatCompletion } = require('./lib/hunyuan')
const { WEEKLY_REPORT_PROMPT } = require('./lib/prompts')

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 天

module.exports = async ({ openid }, db) => {
  const weekMonday = getWeekMonday()
  const cacheKey = `weekly_${weekMonday}`

  // 检查缓存
  const cached = await getCache(db, openid, cacheKey)
  if (cached) return cached

  // 构建画像数据
  const profile = await buildProfile(db, openid)

  if (!profile) {
    return {
      report: null,
      stats: null,
      hint: '新的一周，从一次刷牙开始吧',
    }
  }

  // 注入风险信息到画像上下文
  const { queryWeekRecords } = require('./lib/profileBuilder')
  const thisWeekRecords = await queryWeekRecords(db, openid, 0)
  const risks = detectRisks(profile, thisWeekRecords)
  const profileWithRisks = {
    ...profile,
    触发风险: risks.map(r => r.message),
  }

  // 调用 AI 生成周报
  let report = null
  try {
    report = await chatCompletion([
      { role: 'system', content: WEEKLY_REPORT_PROMPT },
      { role: 'user', content: JSON.stringify(profileWithRisks) },
    ])
  } catch (e) {
    console.error('AI 周报生成失败:', e)
  }

  const result = {
    report,
    stats: {
      completionRate: profile.本周完成率,
      avgDuration: profile.平均用时,
      totalSessions: profile.本周完成次数,
      streakDays: profile.连续刷牙天数,
    },
    weekStart: weekMonday,
    generatedAt: Date.now(),
  }

  await setCache(db, openid, cacheKey, result, CACHE_TTL).catch(() => {})

  return result
}
