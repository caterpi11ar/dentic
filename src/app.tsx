import type { PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'
import { useEffect } from 'react'
import { migrateLocalRecordsToCloud } from '@/services/migration'
import { processSyncQueue } from '@/services/syncQueue'
import { StoreProvider } from '@/stores/provider'
import './app.scss'

// 初始化微信云开发
if (Taro.cloud) {
  Taro.cloud.init({
    env: 'cloud1-4gbgtvob65de4ccd',
    traceUser: true,
  })
}

function App({ children }: PropsWithChildren) {
  useEffect(() => {
    // 启动时处理同步队列（不阻塞渲染）
    processSyncQueue().catch(() => undefined)
    // 一次性迁移本地历史数据到云端（已迁移则跳过）
    migrateLocalRecordsToCloud().catch(() => undefined)
  }, [])

  return <StoreProvider>{children}</StoreProvider>
}

export default App
