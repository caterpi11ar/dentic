// 插入或更新刷牙记录（按 openId + bizDate + session 去重）
module.exports = async ({ openid, bizDate, session, completed, durationSec, completedSteps, source }, db) => {
  if (!bizDate || !session) {
    throw { code: 4001, message: '缺少必要参数', data: null }
  }

  const now = Date.now()

  // 查找已有记录
  const { data: existing } = await db
    .collection('brush_record')
    .where({ openId: openid, bizDate, session })
    .get()

  if (existing.length > 0) {
    // 更新已有记录（取更优结果）
    const record = existing[0]
    const shouldUpdate = completed && !record.completed || durationSec > record.durationSec
    if (shouldUpdate) {
      await db.collection('brush_record').doc(record._id).update({
        data: { completed, durationSec, completedSteps, updatedAt: now },
      })
    }
    return { recordId: record._id }
  }

  // 新建记录
  const result = await db.collection('brush_record').add({
    data: {
      openId: openid,
      bizDate,
      session,
      completed,
      durationSec,
      completedSteps,
      source: source || 'direct',
      createdAt: now,
    },
  })

  return { recordId: result._id }
}
