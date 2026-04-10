import type { FamilyPreview } from '@/services/api/familyApi'
import { Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState } from 'react'
import PageLayout from '@/components/PageLayout'
import Button from '@/components/ui/Button'
import { getFamilyPreview } from '@/services/api/familyApi'
import { familyStore } from '@/stores/family'

export default function FamilyJoinPage() {
  const router = useRouter()
  const familyId = router.params.familyId as string | undefined

  const [preview, setPreview] = useState<FamilyPreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [joining, setJoining] = useState(false)

  // 页面显示时获取家庭预览信息
  Taro.useDidShow(() => {
    if (!familyId) {
      setError('无效的邀请链接')
      setLoading(false)
      return
    }
    setLoading(true)
    getFamilyPreview(familyId).then((info) => {
      setPreview(info)
      setLoading(false)
    }).catch(() => {
      setError('家庭不存在或已解散')
      setLoading(false)
    })
  })

  const handleJoin = () => {
    if (!familyId || joining)
      return
    setJoining(true)
    familyStore.getState().joinFamily(familyId).then(() => {
      Taro.showToast({ title: '已加入家庭', icon: 'success' }).catch(() => undefined)
      Taro.redirectTo({ url: '/pages/family/index' }).catch(() => undefined)
    }).catch((err) => {
      const msg = (err as Error)?.message || '加入失败'
      Taro.showToast({ title: msg, icon: 'none' }).catch(() => undefined)
      setJoining(false)
    })
  }

  // 加载中
  if (loading) {
    return (
      <PageLayout scroll>
        <Text className="text-display-md font-heading font-medium tracking-tight text-content">
          加入家庭
        </Text>
        <View className="mt-16 flex justify-center">
          <Text className="text-paragraph-sm text-content-tertiary">加载中...</Text>
        </View>
      </PageLayout>
    )
  }

  // 错误状态
  if (error || !preview) {
    return (
      <PageLayout scroll>
        <Text className="text-display-md font-heading font-medium tracking-tight text-content">
          加入家庭
        </Text>
        <View className="mt-16 flex flex-col items-center gap-6">
          <Text className="text-paragraph-md font-body text-content-tertiary">
            {error || '家庭不存在或已解散'}
          </Text>
          <Button
            variant="ghost"
            onClick={() => Taro.redirectTo({ url: '/pages/index/index' }).catch(() => undefined)}
            aria-label="返回首页"
          >
            返回首页
          </Button>
        </View>
      </PageLayout>
    )
  }

  // 正常展示
  return (
    <PageLayout scroll>
      <Text className="text-display-md font-heading font-medium tracking-tight text-content">
        加入家庭
      </Text>

      <View className="mt-10 rounded-anthropic border border-line bg-surface-white/80 px-5 py-6">
        <View className="flex flex-col items-center gap-4">
          <View className="size-16 rounded-full bg-primary-light flex items-center justify-center">
            <Text className="text-display-md font-heading text-primary">家</Text>
          </View>
          <Text className="text-display-sm font-heading font-medium text-content">
            {preview.name}
          </Text>
          <View className="flex flex-col items-center gap-1">
            <Text className="text-paragraph-sm font-body text-content-secondary">
              创建者：
              {preview.creatorNickname}
            </Text>
            <Text className="text-paragraph-sm font-body text-content-tertiary">
              当前
              {preview.memberCount}
              人
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-10">
        <Button
          onClick={handleJoin}
          disabled={joining}
          aria-label="加入家庭"
        >
          {joining ? '加入中...' : '加入家庭'}
        </Button>
      </View>

      <View className="mt-6">
        <Button
          variant="ghost"
          onClick={() => Taro.redirectTo({ url: '/pages/index/index' }).catch(() => undefined)}
          aria-label="返回首页"
        >
          返回首页
        </Button>
      </View>
    </PageLayout>
  )
}
