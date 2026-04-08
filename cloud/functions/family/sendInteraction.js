// 发送互动（鼓励/提醒），每人每天每种类型最多 3 次
const MAX_DAILY_PER_TYPE = 3

module.exports = async ({ openid, familyId, type }, db) => {
  if (!familyId || !type) {
    throw { code: 4001, message: '缺少参数', data: null }
  }

  const validTypes = ['like', 'reminder']
  if (!validTypes.includes(type)) {
    throw { code: 4001, message: '无效的互动类型', data: null }
  }

  // 今日 0 点时间戳
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

  // 查询今天该用户该类型的互动次数
  const { total } = await db
    .collection('family_interaction')
    .where({
      familyId,
      fromOpenId: openid,
      type,
      createdAt: db.command.gte(todayStart),
    })
    .count()

  if (total >= MAX_DAILY_PER_TYPE) {
    throw { code: 4003, message: '今天已达上限，明天再来吧', data: null }
  }

  const { _id } = await db.collection('family_interaction').add({
    data: {
      familyId,
      fromOpenId: openid,
      type,
      createdAt: Date.now(),
    },
  })

  return { interactionId: _id }
}
