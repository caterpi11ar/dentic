import { Input, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import PageLayout from '@/components/PageLayout'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import { familyStore } from '@/stores/family'

export default function FamilyCreatePage() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    const trimmedName = name.trim()

    if (!trimmedName) {
      Taro.showToast({ title: '请输入家庭名称', icon: 'none' }).catch(() => undefined)
      return
    }

    setLoading(true)
    try {
      await familyStore.getState().createFamily(trimmedName)
      Taro.showToast({ title: '创建成功', icon: 'success' }).catch(() => undefined)
      Taro.redirectTo({ url: '/pages/family/index' }).catch(() => undefined)
    }
    catch (err) {
      const msg = (err as Error & { code?: number })?.message || '创建失败'
      Taro.showToast({ title: msg, icon: 'none' }).catch(() => undefined)
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout scroll>
      <PageHeader
        title="创建我的家"
        description="创建家庭后，可以邀请家人一起关注孩子的刷牙情况"
      />

      {/* 表单 */}
      <View className="mt-section-gap">
        <Text className="block text-label-sm font-body font-semibold text-content-secondary mb-2">
          家庭名称
        </Text>
        <Input
          className="w-full rounded-anthropic border border-line px-4 py-3 text-paragraph-sm font-body text-content"
          placeholder="例如：小明的家"
          value={name}
          onInput={e => setName(e.detail.value || '')}
          maxlength={20}
        />
      </View>

      <View className="mt-section-gap">
        <Button
          onClick={handleCreate}
          disabled={loading}
          aria-label="创建家庭"
        >
          {loading ? '创建中...' : '创建家庭'}
        </Button>
      </View>

      <View className="mt-page-gap">
        <Button
          variant="ghost"
          onClick={() => Taro.redirectTo({ url: '/pages/family/index' }).catch(() => undefined)}
          aria-label="返回"
        >
          返回
        </Button>
      </View>
    </PageLayout>
  )
}
