// 健康画像 handler
const { buildProfile, getWeekMonday } = require('./lib/profileBuilder')
const { getCache, setCache } = require('./lib/cache')
const { chatCompletion } = require('./lib/hunyuan')
const { HEALTH_PROFILE_PROMPT } = require('./lib/prompts')

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 天

module.exports = async ({ openid }, db) => {
  const weekMonday = getWeekMonday()
  const cacheKey = `profile_${weekMonday}`

  // 检查缓存
  const cached = await getCache(db, openid, cacheKey)
  if (cached) return cached

  // 构建画像数据
  const profile = await buildProfile(db, openid)

  if (!profile) {
    return {
      profile: null,
      summary: null,
      hint: '继续刷牙积累数据，解锁你的口腔健康画像',
    }
  }

  // 调用 AI 生成画像总结
  let summary = null
  try {
    summary = await chatCompletion([
      { role: 'system', content: HEALTH_PROFILE_PROMPT },
      { role: 'user', content: JSON.stringify(profile) },
    ])
  } catch (e) {
    // AI 调用失败，画像数据仍然返回
    console.error('AI 画像总结失败:', e)
  }

  const result = { profile, summary }

  // 写入缓存
  await setCache(db, openid, cacheKey, result, CACHE_TTL).catch(() => {})

  return result
}
