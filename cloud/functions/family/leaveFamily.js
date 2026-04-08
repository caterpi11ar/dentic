// 退出家庭
module.exports = async ({ openid, familyId }, db) => {
  if (!familyId) {
    throw { code: 4001, message: '缺少家庭ID', data: null }
  }

  // 查找用户在该家庭的成员记录
  const { data: memberships } = await db
    .collection('family_member')
    .where({ familyId, openId: openid })
    .limit(1)
    .get()

  if (memberships.length === 0) {
    throw { code: 4004, message: '你不在该家庭中', data: null }
  }

  const membership = memberships[0]

  // 如果是创建者，解散整个家庭
  if (membership.role === 'creator') {
    // 删除所有成员
    const { data: allMembers } = await db
      .collection('family_member')
      .where({ familyId })
      .get()

    for (const m of allMembers) {
      await db.collection('family_member').doc(m._id).remove()
    }

    // 删除家庭
    await db.collection('family').doc(familyId).remove()

    return { dissolved: true }
  }

  // 普通成员直接退出
  await db.collection('family_member').doc(membership._id).remove()

  return { dissolved: false }
}
