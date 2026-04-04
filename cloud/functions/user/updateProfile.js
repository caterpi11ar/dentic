// 更新用户资料（昵称/头像）
module.exports = async ({ openid, nickname, avatar }, db) => {
  const now = Date.now()

  const { data: existing } = await db
    .collection('user_profile')
    .where({ openid })
    .get()

  if (existing.length > 0) {
    const updateData = { updatedAt: now }
    if (nickname !== undefined) updateData.nickname = nickname
    if (avatar !== undefined) updateData.avatar = avatar

    await db
      .collection('user_profile')
      .doc(existing[0]._id)
      .update({ data: updateData })
  } else {
    await db.collection('user_profile').add({
      data: {
        openid,
        nickname: nickname || '',
        avatar: avatar || '',
        createdAt: now,
        updatedAt: now,
      },
    })
  }

  return { success: true }
}
