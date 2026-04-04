// 获取用户资料
module.exports = async ({ openid }, db) => {
  const { data } = await db
    .collection('user_profile')
    .where({ openid })
    .get()

  if (data.length > 0) {
    return {
      openid: data[0].openid,
      nickname: data[0].nickname || '',
      avatar: data[0].avatar || '',
    }
  }

  return { openid, nickname: '', avatar: '' }
}
