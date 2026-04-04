// 全站排行榜（聚合查询优化版）
// periodType: 'totalDays' 累计刷牙天数 | 'streak' 最多连续天数

function getBusinessDate() {
  var d = new Date()
  if (d.getHours() < 6) d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

module.exports = async ({ openid, periodType }, db) => {
  var $ = db.command.aggregate
  var _ = db.command
  var today = getBusinessDate()
  var scores

  if (periodType === 'totalDays') {
    // 累计刷牙天数：聚合获取每个用户的日期集合，JS 端计数
    var { list } = await db
      .collection('brush_record')
      .aggregate()
      .match({ completed: true })
      .group({ _id: '$openId', dates: $.addToSet('$bizDate') })
      .end()

    scores = list.map(function (item) {
      return { openId: item._id, score: item.dates.length }
    })

    scores.sort(function (a, b) { return b.score - a.score })
    scores = scores.slice(0, 100)
  } else if (periodType === 'streak') {
    // 最多连续天数：聚合获取每个用户的日期集合，计算连续天数
    var { list } = await db
      .collection('brush_record')
      .aggregate()
      .match({ completed: true })
      .group({ _id: '$openId', dates: $.addToSet('$bizDate') })
      .end()

    scores = list.map(function (item) {
      var sortedDates = item.dates.sort().reverse()
      var streak = 0
      var checkDate = new Date(today)

      for (var i = 0; i < sortedDates.length; i++) {
        var expected = checkDate.toISOString().slice(0, 10)
        if (sortedDates[i] === expected) {
          streak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else if (sortedDates[i] < expected) {
          break
        }
      }

      return { openId: item._id, score: streak }
    })

    scores.sort(function (a, b) { return b.score - a.score })
    scores = scores.slice(0, 100)
  }

  // 确保当前用户在列表中
  var meInList = scores.some(function (s) { return s.openId === openid })
  if (!meInList) {
    scores.push({ openId: openid, score: 0 })
  }

  // 查询用户资料
  var allOpenIds = scores.map(function (s) { return s.openId })
  var profileMap = {}

  for (var i = 0; i < allOpenIds.length; i += 100) {
    var batch = allOpenIds.slice(i, i + 100)
    var { data: profiles } = await db
      .collection('user_profile')
      .where({ openid: _.in(batch) })
      .limit(100)
      .get()
    for (var p of profiles) {
      profileMap[p.openid] = { nickname: p.nickname || '', avatar: p.avatar || '' }
    }
  }

  // 分配排名
  var currentRank = 0
  var prevScore = -1
  var result = scores.map(function (item, i) {
    if (item.score !== prevScore) {
      currentRank = i + 1
      prevScore = item.score
    }
    var profile = profileMap[item.openId]
    return {
      openId: item.openId,
      nickname: profile && profile.nickname ? profile.nickname : '刷牙达人' + item.openId.slice(-4),
      avatar: profile ? profile.avatar : '',
      score: item.score,
      rank: currentRank,
      isMe: item.openId === openid,
    }
  })

  var myRank = result.find(function (item) { return item.isMe }) || null

  return { list: result.slice(0, 20), myRank: myRank }
}
