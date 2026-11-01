import type { PropsWithChildren } from 'react'
import { Button, Image, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { art } from './assets'
import { Progress, streak, dates } from '../domain/progress'

export function Action({ children, onClick, tone = 'green', disabled = false, className = '' }: PropsWithChildren<{ onClick: () => void; tone?: 'green' | 'blue' | 'outline' | 'danger'; disabled?: boolean; className?: string }>) {
  return <Button className={`action ${disabled ? 'is-disabled' : ''} action-${tone} ${className}`} disabled={disabled} onClick={onClick}>{children}</Button>
}
export function Picture({ name, className = '' }: { name: keyof typeof art; className?: string }) {
  return <Image src={art[name]} className={`picture ${className}`} mode='aspectFit' />
}
export const tabs = [
  { key: 'index', label: '刷牙', icon: 'learn' },
  { key: 'quests', label: '任务', icon: 'quests' },
  { key: 'achievements', label: '成就', icon: 'finish' },
  { key: 'profile', label: '我的', icon: 'mascot' },
] as const
export function goTab(key: string) { void Taro.redirectTo({ url: `/pages/${key}/index` }) }
export function Shell({ active, progress, children }: PropsWithChildren<{ active: string; progress: Progress }>) {
  return <View className='shell'>
    <View className='sidebar'>
      <View className='brand'><Picture name='mascot' /><Text>刷了吗</Text></View>
      <View className='side-links'>{tabs.map(t => <Button key={t.key} hoverClass="nav-pressed" className={`nav-item ${active === t.key ? 'nav-active' : ''}`} onClick={() => active !== t.key && goTab(t.key)}><Picture name={t.icon} /><Text>{t.label}</Text></Button>)}</View>
      <View className='side-note'>每天进步一点点。</View>
    </View>
    <View className='shell-center'>
      <View className='topbar'><View className='language'><Picture name='mascot' /><Text>刷了吗</Text></View><View className='top-values'><View className='stat-mini orange'><Text className='fire'>♨</Text><Text>连续 {streak(progress)} 天</Text></View><View className='stat-mini blue'><Picture name='points' /><Text>{dates(progress).length} 天</Text></View></View></View>
      <View className='page-content'>{children}</View>
    </View>
    <View className='rightbar'>
      <View className='right-card'><Picture name='mascot' className='friend' /><Text className='card-title'>小小牙刷，大大坚持</Text><Text className='muted'>从今天的认真刷牙开始，慢慢养成早晚的好习惯。</Text></View>
      <View className='right-card'><View className='row-between'><Text className='card-title'>我的目标</Text><Text className='blue'>{dates(progress).length} / 7</Text></View><Meter value={dates(progress).length / 7} /><Text className='muted'>第一个目标：累计刷牙 7 天</Text></View>
    </View>
    <View className='bottomnav'>{tabs.map(t => <Button key={t.key} hoverClass="nav-pressed" className={`nav-item ${active === t.key ? 'nav-active' : ''}`} onClick={() => active !== t.key && goTab(t.key)}><Picture name={t.icon} /><Text>{t.label}</Text></Button>)}</View>
  </View>
}
export function Meter({ value }: { value: number }) { return <View className='meter'><View className='meter-fill' style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} /></View> }
export function LoadError({ text }: { text: string }) { return text ? <View className='error-box'>{text}<Text> 请在“我的”中重试读取，或明确清除刷牙记录。</Text></View> : null }
export function Heading({ title, subtitle }: { title: string; subtitle: string }) { return <View className='page-heading'><Text className='page-title'>{title}</Text><Text className='muted'>{subtitle}</Text></View> }
