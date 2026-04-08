import type { PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'
import { useEffect } from 'react'
import { getFamilyPreview } from '@/services/api/familyApi'
import { migrateLocalRecordsToCloud } from '@/services/migration'
import { processSyncQueue } from '@/services/syncQueue'
import { familyStore } from '@/stores/family'
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

    // 处理启动参数中的 familyId（通过分享卡片加入家庭）
    const launchOptions = Taro.getLaunchOptionsSync?.()
    const familyId = launchOptions?.query?.familyId as string | undefined
    if (familyId) {
      getFamilyPreview(familyId).then((preview) => {
        Taro.showModal({
          title: '加入家庭',
          content: `「${preview.name}」邀请你加入，创建者：${preview.creatorNickname}，当前${preview.memberCount}人`,
          confirmText: '加入',
          cancelText: '取消',
        }).then((res) => {
          if (res.confirm) {
            familyStore.getState().joinFamily(familyId).then(() => {
              Taro.showToast({ title: '已加入家庭', icon: 'success' }).catch(() => undefined)
              Taro.redirectTo({ url: '/pages/family/index' }).catch(() => undefined)
            }).catch((err) => {
              const msg = (err as Error)?.message || '加入失败'
              Taro.showToast({ title: msg, icon: 'none' }).catch(() => undefined)
            })
          }
        }).catch(() => undefined)
      }).catch(() => {
        Taro.showToast({ title: '家庭不存在或已解散', icon: 'none' }).catch(() => undefined)
      })
    }
  }, [])

  return <StoreProvider>{children}</StoreProvider>
}

export default App
