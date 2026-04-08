// 通过 familyId 获取家庭基本信息（用于邀请预览）
module.exports = async ({ openid, familyId }, db) => {
  if (!familyId) {
    throw { code: 4001, message: '缺少家庭ID', data: null }
  }

  try {
    const { data: family } = await db.collection('family').doc(familyId).get()

    // 获取成员数量
    const { total } = await db
      .collection('family_member')
      .where({ familyId })
      .count()

    // 获取创建者昵称
    const { data: profiles } = await db
      .collection('user_profile')
      .where({ openid: family.creatorOpenId })
      .limit(1)
      .get()

    return {
      familyId,
      name: family.name,
      memberCount: total,
      creatorNickname: profiles[0]?.nickname || '未知',
    }
  } catch {
    throw { code: 4004, message: '家庭不存在', data: null }
  }
}
