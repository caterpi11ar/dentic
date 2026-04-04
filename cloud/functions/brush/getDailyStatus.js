// 获取指定日期的刷牙完成状态
module.exports = async ({ openid, bizDate }, db) => {
  if (!bizDate) {
    throw { code: 4001, message: '缺少日期参数', data: null }
  }

  const { data: records } = await db
    .collection('brush_record')
    .where({ openId: openid, bizDate })
    .get()

  const result = {
    morningDone: false,
    eveningDone: false,
    morningTime: undefined,
    eveningTime: undefined,
  }

  for (const r of records) {
    if (r.session === 'morning' && r.completed) {
      result.morningDone = true
      result.morningTime = r.createdAt
    }
    if (r.session === 'evening' && r.completed) {
      result.eveningDone = true
      result.eveningTime = r.createdAt
    }
  }

  return result
}
