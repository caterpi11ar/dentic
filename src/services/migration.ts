import Taro from '@tarojs/taro'
import { upsertBrushRecord } from '@/services/api/brushApi'
import { getRecords } from '@/services/recordStorage'

const MIGRATION_FLAG_KEY = 'cloud_migration_done'

/** 检查是否需要迁移，需要则执行一次性迁移 */
export async function migrateLocalRecordsToCloud(): Promise<void> {
  // 已迁移过，跳过
  try {
    if (Taro.getStorageSync(MIGRATION_FLAG_KEY))
      return
  }
  catch {
    return
  }

  const localRecords = getRecords()
  if (localRecords.length === 0) {
    // 无本地数据，直接标记完成
    markMigrationDone()
    return
  }

  // 逐条上传（失败不中断，下次启动会重试）
  let allSuccess = true
  for (const record of localRecords) {
    if (!record.completed)
      continue
    try {
      await upsertBrushRecord({
        bizDate: record.date,
        session: record.session,
        completed: record.completed,
        durationSec: record.duration,
        completedSteps: record.completedSteps,
        source: 'local_sync',
      })
    }
    catch {
      allSuccess = false
    }
  }

  // 全部成功才标记完成，否则下次启动重试
  if (allSuccess) {
    markMigrationDone()
  }
}

function markMigrationDone(): void {
  try {
    Taro.setStorageSync(MIGRATION_FLAG_KEY, true)
  }
  catch {
    // 静默处理
  }
}
