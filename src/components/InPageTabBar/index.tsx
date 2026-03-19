import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'

type TabKey = 'brush' | 'history' | 'settings'

type InPageTabBarProps = {
  current: TabKey
}

const TABS: Array<{ key: TabKey; label: string; icon: string; path: string }> = [
  { key: 'brush', label: '刷牙', icon: '🏠', path: '/pages/index/index' },
  { key: 'history', label: '记录', icon: '📅', path: '/pages/history/index' },
  { key: 'settings', label: '设置', icon: '⚙️', path: '/pages/settings/index' },
]

export default function InPageTabBar({ current }: InPageTabBarProps) {
  const handleNavigate = (tab: (typeof TABS)[number]) => {
    if (tab.key === current) return
    Taro.redirectTo({ url: tab.path })
  }

  return (
    <View className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-surface-white rounded-t-[3rem] border-t border-line">
      {TABS.map((tab) => {
        const active = tab.key === current
        return (
          <View
            key={tab.key}
            className={`flex flex-col items-center justify-center px-6 py-2.5 rounded-full ${
              active ? 'bg-primary-light text-primary' : 'text-content-tertiary'
            }`}
            onClick={() => handleNavigate(tab)}
          >
            <Text className="mb-1 text-lg leading-none">{tab.icon}</Text>
            <Text className="text-sm font-semibold tracking-[0.08em]">{tab.label}</Text>
          </View>
        )
      })}
    </View>
  )
}
