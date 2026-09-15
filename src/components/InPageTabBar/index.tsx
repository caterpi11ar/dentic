import { Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useRef } from 'react'
import iconBrushActive from '@/assets/icons/tab-brush-active.svg'
import iconBrushInactive from '@/assets/icons/tab-brush-inactive.svg'
import iconHistoryActive from '@/assets/icons/tab-history-active.svg'
import iconHistoryInactive from '@/assets/icons/tab-history-inactive.svg'
import iconProfileActive from '@/assets/icons/tab-profile-active.svg'
import iconProfileInactive from '@/assets/icons/tab-profile-inactive.svg'
import BottomNav from '@/components/ui/BottomNav'

type TabKey = 'brush' | 'history' | 'profile'

interface InPageTabBarProps {
  current: TabKey
}

const TAB_ICONS: Record<TabKey, { active: string, inactive: string }> = {
  brush: { active: iconBrushActive, inactive: iconBrushInactive },
  history: { active: iconHistoryActive, inactive: iconHistoryInactive },
  profile: { active: iconProfileActive, inactive: iconProfileInactive },
}

const TAB_DEFS: Array<{ key: TabKey, label: string, path: string }> = [
  { key: 'brush', label: '刷牙', path: '/pages/index/index' },
  { key: 'history', label: '历史', path: '/pages/history/index' },
  { key: 'profile', label: '我的', path: '/pages/profile/index' },
]

export default function InPageTabBar({ current }: InPageTabBarProps) {
  const isNavigatingRef = useRef(false)

  useDidShow(() => {
    isNavigatingRef.current = false
    try {
      Taro.hideLoading()
    }
    catch {}
    try {
      Taro.hideNavigationBarLoading()
    }
    catch {}
  })

  const handleNavigate = (key: TabKey) => {
    const tab = TAB_DEFS.find(item => item.key === key)
    if (!tab || tab.key === current || isNavigatingRef.current)
      return

    isNavigatingRef.current = true
    try {
      Taro.showLoading({ title: '', mask: true })
    }
    catch {
      try {
        Taro.showNavigationBarLoading()
      }
      catch {}
    }
    Taro.redirectTo({ url: tab.path }).catch(() => {
      isNavigatingRef.current = false
      try {
        Taro.hideLoading()
      }
      catch {}
      try {
        Taro.hideNavigationBarLoading()
      }
      catch {}
    })
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
