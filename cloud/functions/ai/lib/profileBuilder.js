// 健康画像数据聚合（从 brush_record 集合聚合用户近 N 周数据）

const ZONE_GROUPS = {
  '上牙外侧': ['upper-outer-left', 'upper-outer-front', 'upper-outer-right'],
  '上牙内侧': ['upper-inner-left', 'upper-inner-front', 'upper-inner-right'],
  '上牙咬合面': ['upper-occlusal'],
  '下牙外侧': ['lower-outer-right', 'lower-outer-front', 'lower-outer-left'],
  '下牙内侧': ['lower-inner-right', 'lower-inner-front', 'lower-inner-left'],
  '下牙咬合面': ['lower-occlusal'],
  '舌面': ['tongue'],
}

/**
 * 获取本周一的日期字符串
 */
function getWeekMonday(offsetWeeks = 0) {
  const now = new Date()
  const day = now.getDay() || 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - day + 1 + offsetWeeks * 7)
  const y = monday.getFullYear()
  const m = String(monday.getMonth() + 1).padStart(2, '0')
  const d = String(monday.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 获取本周日的日期字符串
 */
function getWeekSunday(offsetWeeks = 0) {
  const now = new Date()
  const day = now.getDay() || 7
  const sunday = new Date(now)
  sunday.setDate(now.getDate() - day + 7 + offsetWeeks * 7)
  const y = sunday.getFullYear()
  const m = String(sunday.getMonth() + 1).padStart(2, '0')
  const d = String(sunday.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 从 brush_record 集合查询指定周范围的记录
 */
async function queryWeekRecords(db, openId, offsetWeeks = 0) {
  const monday = getWeekMonday(offsetWeeks)
  const sunday = getWeekSunday(offsetWeeks)
  const _ = db.command

  const { data } = await db
    .collection('brush_record')
    .where({
      openId,
      bizDate: _.gte(monday).and(_.lte(sunday)),
    })
    .get()

  return data
}

/**
 * 聚合区域覆盖数据
 */
function aggregateZoneCoverage(records) {
  const zoneTotals = {} // zone -> { totalDuration, count }

  for (const record of records) {
    if (!record.stepDetails) continue
    for (const step of record.stepDetails) {
      if (!zoneTotals[step.zone]) {
        zoneTotals[step.zone] = { totalDuration: 0, count: 0, skippedCount: 0, totalRecords: 0 }
      }
      const z = zoneTotals[step.zone]
      z.totalRecords++
      if (step.skipped) {
        z.skippedCount++
      } else {
        z.totalDuration += step.actualDuration
        z.count++
      }
    }
  }

  // 按区域分组聚合
  const grouped = {}
  for (const [groupName, zones] of Object.entries(ZONE_GROUPS)) {
    let totalDuration = 0
    let count = 0
    let totalRecords = 0
    let skippedCount = 0

    for (const zone of zones) {
      const z = zoneTotals[zone]
      if (z) {
        totalDuration += z.totalDuration
        count += z.count
        totalRecords += z.totalRecords
        skippedCount += z.skippedCount
      }
    }

    const avgDuration = count > 0 ? Math.round((totalDuration / count) * 10) / 10 : 0
    const coverageRate = totalRecords > 0
      ? Math.round(((totalRecords - skippedCount) / totalRecords) * 100)
      : 0

    grouped[groupName] = {
      平均时长: avgDuration,
      覆盖率: `${coverageRate}%`,
    }
  }

  return grouped
}

/**
 * 构建完整的健康画像数据
 */
async function buildProfile(db, openId) {
  const thisWeekRecords = await queryWeekRecords(db, openId, 0)
  const lastWeekRecords = await queryWeekRecords(db, openId, -1)

  const allRecent = [...thisWeekRecords, ...lastWeekRecords]

  if (allRecent.length === 0) {
    return null // 无数据
  }

  // 区域覆盖
  const zoneCoverage = aggregateZoneCoverage(allRecent)

  // 完成率
  const completedCount = thisWeekRecords.filter(r => r.completed).length
  const totalPossible = 14 // 每天早晚各一次，7天
  const completionRate = Math.round((completedCount / totalPossible) * 100)

  // 早晚比
  const morningCount = thisWeekRecords.filter(r => r.session === 'morning' && r.completed).length
  const eveningCount = thisWeekRecords.filter(r => r.session === 'evening' && r.completed).length

  // 平均用时
  const completedRecords = thisWeekRecords.filter(r => r.completed && r.durationSec)
  const avgDuration = completedRecords.length > 0
    ? Math.round(completedRecords.reduce((sum, r) => sum + r.durationSec, 0) / completedRecords.length)
    : 0
  const avgMin = Math.floor(avgDuration / 60)
  const avgSec = avgDuration % 60

  // 放弃次数
  const abandonedCount = thisWeekRecords.filter(r => r.abandoned).length

  // 连续天数（简单计算本周的）
  const thisWeekDates = [...new Set(thisWeekRecords.filter(r => r.completed).map(r => r.bizDate))].sort()
  const lastWeekCompleted = lastWeekRecords.filter(r => r.completed).length

  // 上周完成数
  const lastWeekCompletedCount = lastWeekRecords.filter(r => r.completed).length

  return {
    区域覆盖: zoneCoverage,
    本周完成率: `${completionRate}%`,
    早晚比: `${morningCount}:${eveningCount}`,
    平均用时: `${avgMin}分${String(avgSec).padStart(2, '0')}秒`,
    放弃次数: abandonedCount,
    本周完成次数: completedCount,
    上周完成次数: lastWeekCompletedCount,
    连续刷牙天数: thisWeekDates.length,
  }
}

module.exports = { buildProfile, queryWeekRecords, aggregateZoneCoverage, getWeekMonday }
