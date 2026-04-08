// 获取家庭看板数据：逐成员的今日状态 + 本周完成情况
module.exports = async ({ openid, familyId }, db) => {
  if (!familyId) {
    throw { code: 4001, message: '缺少家庭ID', data: null }
  }

  // 获取家庭成员
  const { data: members } = await db
    .collection('family_member')
    .where({ familyId })
    .get()

  const openIds = members.map(m => m.openId)

  // 校验调用者是否属于该家庭
  if (!openIds.includes(openid)) {
    throw { code: 4003, message: '你不是该家庭成员', data: null }
  }

  // 获取成员 profile
  const { data: profiles } = await db
    .collection('user_profile')
    .where({ openid: db.command.in(openIds) })
    .get()

  const profileMap = {}
  for (const p of profiles) {
    profileMap[p.openid] = { nickname: p.nickname, avatar: p.avatar }
  }

  // 业务日计算
  const now = new Date()
  const anchor = new Date(now)
  if (anchor.getHours() < 4) {
    anchor.setDate(anchor.getDate() - 1)
  }

  const formatDate = (d) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  // 本周范围
  const dayOfWeek = anchor.getDay() || 7
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() - dayOfWeek + 1)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const mondayStr = formatDate(monday)
  const sundayStr = formatDate(sunday)
  const todayStr = formatDate(anchor)

  // 查询本周所有成员的刷牙记录
  const { data: records } = await db
    .collection('brush_record')
    .where({
      openId: db.command.in(openIds),
      bizDate: db.command.gte(mondayStr).and(db.command.lte(sundayStr)),
      completed: true,
    })
    .get()

  // 逐成员聚合
  const memberList = members.map(m => {
    const mid = m.openId
    const myRecords = records.filter(r => r.openId === mid)

    // 今日
    const todayRecords = myRecords.filter(r => r.bizDate === todayStr)
    const today = {
      morningDone: todayRecords.some(r => r.session === 'morning'),
      eveningDone: todayRecords.some(r => r.session === 'evening'),
      morningTime: todayRecords.find(r => r.session === 'morning')?.createdAt,
      eveningTime: todayRecords.find(r => r.session === 'evening')?.createdAt,
    }

    // 本周
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const dateStr = formatDate(d)
      const dayRecs = myRecords.filter(r => r.bizDate === dateStr)
      weekDays.push({
        date: dateStr,
        morningDone: dayRecs.some(r => r.session === 'morning'),
        eveningDone: dayRecs.some(r => r.session === 'evening'),
      })
    }

    return {
      openId: mid,
      nickname: profileMap[mid]?.nickname || '未设置',
      avatar: profileMap[mid]?.avatar || '',
      role: m.role,
      today,
      weekDays,
    }
  })

  // 家庭连续天数（任一成员有记录即算）
  const allRecords = await db
    .collection('brush_record')
    .where({
      openId: db.command.in(openIds),
      completed: true,
    })
    .orderBy('bizDate', 'desc')
    .limit(200)
    .get()

  const uniqueDates = [...new Set(allRecords.data.map(r => r.bizDate))].sort().reverse()
  let streak = 0
  const checkDate = new Date(anchor)
  if (!uniqueDates.includes(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1)
  }
  for (let i = 0; i < uniqueDates.length; i++) {
    const expected = formatDate(checkDate)
    if (uniqueDates.includes(expected)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return { members: memberList, streak }
}
