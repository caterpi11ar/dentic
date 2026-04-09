// ai_cache 集合读写

/**
 * 读取缓存
 * @returns {object|null} 缓存内容，过期或不存在返回 null
 */
async function getCache(db, openId, cacheKey) {
  const { data } = await db
    .collection('ai_cache')
    .where({ openId, cacheKey })
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get()

  if (data.length === 0) return null

  const record = data[0]
  if (record.expiresAt < Date.now()) {
    // 过期，顺带清理
    db.collection('ai_cache').doc(record._id).remove().catch(() => {})
    return null
  }

  return record.content
}

/**
 * 写入缓存
 */
async function setCache(db, openId, cacheKey, content, ttlMs) {
  const now = Date.now()

  // 先尝试删除旧的同 key 缓存
  const { data: existing } = await db
    .collection('ai_cache')
    .where({ openId, cacheKey })
    .get()

  for (const record of existing) {
    db.collection('ai_cache').doc(record._id).remove().catch(() => {})
  }

  await db.collection('ai_cache').add({
    data: {
      openId,
      cacheKey,
      content,
      createdAt: now,
      expiresAt: now + ttlMs,
    },
  })
}

module.exports = { getCache, setCache }
