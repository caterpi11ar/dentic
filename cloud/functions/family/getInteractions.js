// 获取今日家庭互动列表
module.exports = async ({ openid, familyId }, db) => {
  if (!familyId) {
    throw { code: 4001, message: '缺少家庭ID', data: null }
  }

  // 今天 0 点时间戳
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

  const { data: interactions } = await db
    .collection('family_interaction')
    .where({
      familyId,
      createdAt: db.command.gte(todayStart),
    })
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get()

  // 获取发送者 profile
  const openIds = [...new Set(interactions.map(i => i.fromOpenId))]
  let profileMap = {}
  if (openIds.length > 0) {
    const { data: profiles } = await db
      .collection('user_profile')
      .where({ openid: db.command.in(openIds) })
      .get()
    for (const p of profiles) {
      profileMap[p.openid] = { nickname: p.nickname, avatar: p.avatar }
    }
  }

  return interactions.map(i => ({
    id: i._id,
    type: i.type,
    fromOpenId: i.fromOpenId,
    fromNickname: profileMap[i.fromOpenId]?.nickname || '家人',
    createdAt: i.createdAt,
  }))
}
