import { Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import iconBrushActive from '@/assets/icons/tab-brush-active.svg'
import iconBrushInactive from '@/assets/icons/tab-brush-inactive.svg'
import iconFamilyActive from '@/assets/icons/tab-family-active.svg'
import iconFamilyInactive from '@/assets/icons/tab-family-inactive.svg'
import iconHistoryActive from '@/assets/icons/tab-history-active.svg'
import iconHistoryInactive from '@/assets/icons/tab-history-inactive.svg'
import iconProfileActive from '@/assets/icons/tab-profile-active.svg'
import iconProfileInactive from '@/assets/icons/tab-profile-inactive.svg'
import iconRankActive from '@/assets/icons/tab-rank-active.svg'
import iconRankInactive from '@/assets/icons/tab-rank-inactive.svg'
import BottomNav from '@/components/ui/BottomNav'

type TabKey = 'brush' | 'history' | 'family' | 'rank' | 'profile'

interface InPageTabBarProps {
  current: TabKey
}

const TAB_ICONS: Record<TabKey, { active: string, inactive: string }> = {
  brush: { active: iconBrushActive, inactive: iconBrushInactive },
  history: { active: iconHistoryActive, inactive: iconHistoryInactive },
  family: { active: iconFamilyActive, inactive: iconFamilyInactive },
  rank: { active: iconRankActive, inactive: iconRankInactive },
  profile: { active: iconProfileActive, inactive: iconProfileInactive },
}

const TAB_DEFS: Array<{ key: TabKey, label: string, path: string }> = [
  { key: 'brush', label: '刷牙', path: '/pages/index/index' },
  { key: 'history', label: '历史', path: '/pages/history/index' },
  { key: 'family', label: '家庭', path: '/pages/family/index' },
  { key: 'rank', label: '排行', path: '/pages/rank/index' },
  { key: 'profile', label: '我的', path: '/pages/profile/index' },
]

export default function InPageTabBar({ current }: InPageTabBarProps) {
  const handleNavigate = (key: TabKey) => {
    const tab = TAB_DEFS.find(item => item.key === key)
    if (!tab || tab.key === current)
      return
    Taro.redirectTo({ url: tab.path }).catch(() => undefined)
  }

  const items = TAB_DEFS.map(tab => ({
    key: tab.key,
    label: tab.label,
    icon: (
      <Image
        src={current === tab.key ? TAB_ICONS[tab.key].active : TAB_ICONS[tab.key].inactive}
        className="size-5"
        mode="aspectFit"
      />
    ),
  }))

  return (
    <BottomNav
      items={items}
      activeKey={current}
      onChange={handleNavigate}
    />
  )
}
