// 风险预警检测 handler
const { buildProfile, queryWeekRecords } = require('./lib/profileBuilder')
const { detectRisks } = require('./lib/riskRules')
const { getCache, setCache } = require('./lib/cache')
const { chatCompletion } = require('./lib/hunyuan')
const { RISK_WARNING_PROMPT } = require('./lib/prompts')

const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 小时

function getTodayBizDate() {
  const now = new Date()
  // 凌晨 4 点前算昨天
  if (now.getHours() < 4) {
    now.setDate(now.getDate() - 1)
  }
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

module.exports = async ({ openid }, db) => {
  const bizDate = getTodayBizDate()
  const cacheKey = `risk_${bizDate}`

  // 检查缓存
  const cached = await getCache(db, openid, cacheKey)
  if (cached) return cached

  // 构建画像 + 检测风险
  const profile = await buildProfile(db, openid)
  const thisWeekRecords = await queryWeekRecords(db, openid, 0)
  const risks = detectRisks(profile, thisWeekRecords)

  if (risks.length === 0) {
    const result = { risks: [], aiTip: null }
    await setCache(db, openid, cacheKey, result, CACHE_TTL).catch(() => {})
    return result
  }

  // 仅对最高优先级风险调用 AI 生成自然语言提示
  const topRisk = risks[0]
  let aiTip = null
  try {
    aiTip = await chatCompletion([
      { role: 'system', content: RISK_WARNING_PROMPT },
      { role: 'user', content: JSON.stringify(topRisk.data) },
    ], { maxTokens: 150 })
  } catch (e) {
    console.error('AI 风险提示生成失败:', e)
    // 降级为规则引擎的预设文案
    aiTip = topRisk.message
  }

  const result = {
    risks: risks.map(r => ({ type: r.type, severity: r.severity, message: r.message })),
    aiTip,
  }

  await setCache(db, openid, cacheKey, result, CACHE_TTL).catch(() => {})

  return result
}
