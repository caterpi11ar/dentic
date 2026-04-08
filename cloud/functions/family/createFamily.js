// 创建家庭 + 创建者自动加入
module.exports = async ({ openid, name }, db) => {
  if (!name) {
    throw { code: 4001, message: '请填写家庭名称', data: null }
  }

  // 检查用户是否已有家庭
  const { data: existing } = await db
    .collection('family_member')
    .where({ openId: openid })
    .limit(1)
    .get()

  if (existing.length > 0) {
    throw { code: 4002, message: '你已经加入了一个家庭', data: null }
  }

  const now = Date.now()

  // 创建家庭
  const { _id: familyId } = await db.collection('family').add({
    data: {
      name,
      creatorOpenId: openid,
      createdAt: now,
    },
  })

  // 创建者加入
  await db.collection('family_member').add({
    data: {
      familyId,
      openId: openid,
      role: 'creator',
      joinedAt: now,
    },
  })

  return { familyId }
}
