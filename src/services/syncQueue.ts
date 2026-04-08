import type { SyncQueueItem } from '@/types'
import Taro from '@tarojs/taro'
import { upsertBrushRecord } from '@/services/api/brushApi'

const SYNC_QUEUE_KEY = 'brush_sync_queue'
const MAX_RETRIES = 3

/** 获取同步队列 */
export function getSyncQueue(): SyncQueueItem[] {
  try {
    return (Taro.getStorageSync(SYNC_QUEUE_KEY) as SyncQueueItem[]) || []
  }
  catch {
    return []
  }
}

function saveQueue(queue: SyncQueueItem[]): void {
  try {
    Taro.setStorageSync(SYNC_QUEUE_KEY, queue)
  }
  catch {
    // 静默处理
  }
}

/** 添加条目到同步队列 */
export function enqueueSyncItem(payload: SyncQueueItem['payload']): void {
  const queue = getSyncQueue()
  const item: SyncQueueItem = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    payload,
    retryCount: 0,
    createdAt: Date.now(),
  }
  queue.push(item)
  saveQueue(queue)
}

/** 从队列移除指定条目 */
export function dequeueSyncItem(id: string): void {
  const queue = getSyncQueue().filter(item => item.id !== id)
  saveQueue(queue)
}

/** 处理同步队列：逐条重试上报 */
export async function processSyncQueue(): Promise<void> {
  const queue = getSyncQueue()
  if (queue.length === 0)
    return

  const remaining: SyncQueueItem[] = []

  for (const item of queue) {
    try {
      await upsertBrushRecord({
        ...item.payload,
        source: 'local_sync',
      })
      // 成功，不保留
    }
    catch {
      // 失败，增加重试计数
      if (item.retryCount + 1 < MAX_RETRIES) {
        remaining.push({ ...item, retryCount: item.retryCount + 1 })
      }
      // 超过最大重试次数则丢弃
    }
  }

  saveQueue(remaining)
}
