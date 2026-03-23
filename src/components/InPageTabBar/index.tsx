import Taro from '@tarojs/taro'
import BottomNav from '@/components/ui/BottomNav'

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
  const handleNavigate = (key: TabKey) => {
    const tab = TABS.find((item) => item.key === key)
    if (!tab || tab.key === current) return
    Taro.redirectTo({ url: tab.path }).catch(() => undefined)
  }

  return (
    <BottomNav
      items={TABS}
      activeKey={current}
      onChange={handleNavigate}
    />
  )
}
