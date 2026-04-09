// 插入或更新刷牙记录（按 openId + bizDate + session 去重）
module.exports = async ({ openid, bizDate, session, completed, durationSec, completedSteps, source, stepDetails, pauseCount, totalPauseDuration, abandoned, abandonedAtStep }, db) => {
  if (!bizDate || !session) {
    throw { code: 4001, message: '缺少必要参数', data: null }
  }

  const now = Date.now()

  // 可选的新增字段（向后兼容）
  const extraFields = {}
  if (stepDetails) extraFields.stepDetails = stepDetails
  if (typeof pauseCount === 'number') extraFields.pauseCount = pauseCount
  if (typeof totalPauseDuration === 'number') extraFields.totalPauseDuration = totalPauseDuration
  if (typeof abandoned === 'boolean') extraFields.abandoned = abandoned
  if (typeof abandonedAtStep === 'number') extraFields.abandonedAtStep = abandonedAtStep

  // 查找已有记录
  const { data: existing } = await db
    .collection('brush_record')
    .where({ openId: openid, bizDate, session })
    .get()

  if (existing.length > 0) {
    // 更新已有记录（防降级：已完成的记录不被中途退出记录覆盖）
    const record = existing[0]
    const shouldUpdate = (completed && !record.completed)
      || (completed === record.completed && durationSec > record.durationSec)
    if (shouldUpdate) {
      await db.collection('brush_record').doc(record._id).update({
        data: { completed, durationSec, completedSteps, ...extraFields, updatedAt: now },
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
      ...extraFields,
      createdAt: now,
    },
  })

  return { recordId: result._id }
}
