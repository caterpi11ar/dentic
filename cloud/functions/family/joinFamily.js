// 通过 familyId 加入家庭
const MAX_FAMILY_MEMBERS = 10

module.exports = async ({ openid, familyId }, db) => {
  if (!familyId) {
    throw { code: 4001, message: '缺少家庭ID', data: null }
  }

  // 检查家庭是否存在
  const { data: family } = await db.collection('family').doc(familyId).get()
  if (!family) {
    throw { code: 4004, message: '家庭不存在', data: null }
  }

  // 检查用户是否已加入
  const { data: existingByOpenId } = await db
    .collection('family_member')
    .where({ openId: openid })
    .limit(1)
    .get()

  let existing = existingByOpenId
  // 兼容历史数据字段名 openid
  if (existing.length === 0) {
    const { data: existingByOpenid } = await db
      .collection('family_member')
      .where({ openid })
      .limit(1)
      .get()
    existing = existingByOpenid
  }

  if (existing.length > 0) {
    if (existing[0].familyId === familyId) {
      return { familyId, alreadyJoined: true }
    }
    throw { code: 4002, message: '你已加入其他家庭，不能重复加入', data: null }
  }

  // 检查家庭成员上限
  const { total } = await db
    .collection('family_member')
    .where({ familyId })
    .count()

  if (total >= MAX_FAMILY_MEMBERS) {
    throw { code: 4003, message: '该家庭已满员', data: null }
  }

  await db.collection('family_member').add({
    data: {
      familyId,
      openId: openid,
      role: 'member',
      joinedAt: Date.now(),
    },
  })

  return { familyId, alreadyJoined: false }
}
