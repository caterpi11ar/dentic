// 获取当前用户的家庭信息 + 成员列表
module.exports = async ({ openid }, db) => {
  // 查找用户所在家庭
  const { data: memberships } = await db
    .collection('family_member')
    .where({ openId: openid })
    .limit(1)
    .get()

  if (memberships.length === 0) {
    return null
  }

  const { familyId } = memberships[0]

  // 获取家庭信息
  const { data: family } = await db.collection('family').doc(familyId).get()

  // 获取所有成员
  const { data: members } = await db
    .collection('family_member')
    .where({ familyId })
    .get()

  // 获取成员 profile
  const openIds = members.map(m => m.openId)
  const { data: profiles } = await db
    .collection('user_profile')
    .where({ openid: db.command.in(openIds) })
    .get()

  const profileMap = {}
  for (const p of profiles) {
    profileMap[p.openid] = { nickname: p.nickname, avatar: p.avatar }
  }

  const memberList = members.map(m => ({
    openId: m.openId,
    role: m.role,
    nickname: profileMap[m.openId]?.nickname || '未设置',
    avatar: profileMap[m.openId]?.avatar || '',
    joinedAt: m.joinedAt,
  }))

  return {
    familyId,
    name: family.name,
    creatorOpenId: family.creatorOpenId,
    members: memberList,
  }
}
