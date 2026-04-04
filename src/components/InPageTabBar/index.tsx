import Taro from '@tarojs/taro'
import BottomNav from '@/components/ui/BottomNav'

type TabKey = 'brush' | 'history' | 'rank' | 'profile'

type InPageTabBarProps = {
  current: TabKey
}

const TABS: Array<{ key: TabKey; label: string; icon: string; path: string }> = [
  { key: 'brush', label: '刷牙', icon: '🏠', path: '/pages/index/index' },
  { key: 'history', label: '历史', icon: '📅', path: '/pages/history/index' },
  { key: 'rank', label: '排行榜', icon: '🏆', path: '/pages/rank/index' },
  { key: 'profile', label: '我的', icon: '👤', path: '/pages/profile/index' },
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
