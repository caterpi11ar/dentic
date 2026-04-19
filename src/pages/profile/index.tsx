import { Image, Input, Button as TaroButton, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import iconBell from '@/assets/icons/icon-bell.svg'
import iconMusic from '@/assets/icons/icon-music.svg'
import iconUser from '@/assets/icons/icon-user.svg'
import iconVoice from '@/assets/icons/icon-voice.svg'
import AvatarImage from '@/components/AvatarImage'
import InPageTabBar from '@/components/InPageTabBar'
import PageLayout from '@/components/PageLayout'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import IconBadge from '@/components/ui/IconBadge'
import { List, ListItem } from '@/components/ui/List'
import PageHeader from '@/components/ui/PageHeader'
import Section from '@/components/ui/Section'
import Switch from '@/components/ui/Switch'
import { applyLightThemeToChrome } from '@/services/theme'
import { useProfileStore } from '@/stores/profile'
import { useSettingsStore } from '@/stores/settings'

export default function ProfilePage() {
  const reminderEnabled = useSettingsStore(s => s.reminderEnabled)
  const reminderTime = useSettingsStore(s => s.reminderTime)
  const soundEnabled = useSettingsStore(s => s.soundEnabled)
  const voiceEnabled = useSettingsStore(s => s.voiceEnabled)
  const updateSettings = useSettingsStore(s => s.updateSettings)

  const nickname = useProfileStore(s => s.nickname)
  const avatar = useProfileStore(s => s.avatar)
  const authorized = useProfileStore(s => s.authorized)
  const updateNickname = useProfileStore(s => s.updateNickname)
  const updateAvatar = useProfileStore(s => s.updateAvatar)
  const fetchProfile = useProfileStore(s => s.fetchProfile)

  const [showNicknameInput, setShowNicknameInput] = useState(false)
  const [tempNickname, setTempNickname] = useState('')

  useDidShow(() => {
    applyLightThemeToChrome()
    fetchProfile()
  })

  const handleChooseAvatar = (e: { detail: { avatarUrl?: string } }) => {
    const url = e?.detail?.avatarUrl
    if (url) {
      updateAvatar(url)
      setShowNicknameInput(true)
    }
  }

  const handleNicknameInput = (e: { detail: { value?: string } }) => {
    const value = e?.detail?.value || ''
    setTempNickname(value)
  }

  const handleNicknameConfirm = (e: { detail: { value?: string } }) => {
    const value = (e?.detail?.value || tempNickname || '').trim()
    if (value) {
      updateNickname(value)
      setShowNicknameInput(false)
      Taro.showToast({ title: '设置成功', icon: 'success', duration: 1000 }).catch(() => undefined)
    }
  }

  const handleSaveNickname = () => {
    const value = tempNickname.trim()
    if (value) {
      updateNickname(value)
      setShowNicknameInput(false)
      Taro.showToast({ title: '设置成功', icon: 'success', duration: 1000 }).catch(() => undefined)
    }
    else {
      Taro.showToast({ title: '请输入昵称', icon: 'none' }).catch(() => undefined)
    }
  }

  const handleReminderToggle = () => {
    if (!reminderEnabled) {
      Taro.showModal({
        title: '设置提醒',
        content: `当前版本暂不支持自动推送提醒。\n\n建议您在手机闹钟中设置每天 ${reminderTime} 的刷牙提醒。`,
        showCancel: false,
        confirmText: '我知道了',
      })
    }
    updateSettings({ reminderEnabled: !reminderEnabled })
  }

  const handleSoundToggle = () => {
    updateSettings({ soundEnabled: !soundEnabled })
  }

  const handleVoiceToggle = () => {
    updateSettings({ voiceEnabled: !voiceEnabled })
  }

  return (
    <PageLayout scroll>
      <PageHeader title="我的" />

      {/* ── 用户信息卡片 ── */}
      <Card>
        <CardContent>
          {authorized && !showNicknameInput ? (
          /* 已授权：展示头像和昵称，点击可重新设置 */
            <TaroButton
              openType="chooseAvatar"
              onChooseAvatar={handleChooseAvatar}
              className="!p-0 !m-0 !bg-transparent !border-0 after:!border-0 w-full"
            >
              <View className="flex items-center gap-4">
                <View className="size-14 rounded-full bg-primary-light flex items-center justify-center overflow-hidden flex-shrink-0">
                  {avatar ? (
                    <AvatarImage src={avatar} className="size-14 rounded-full" mode="aspectFill" />
                  ) : (
                    <Text className="text-xl font-body font-semibold text-primary">
                      {nickname.slice(0, 1)}
                    </Text>
                  )}
                </View>
                <View className="flex-1 min-w-0 text-left">
                  <Text className="text-paragraph-md font-body font-semibold text-content truncate">
                    {nickname}
                  </Text>
                  <Text className="mt-0.5 block text-label-xs text-content-disabled">
                    点击更换头像
                  </Text>
                </View>
              </View>
            </TaroButton>
          ) : showNicknameInput ? (
          /* 头像已选，正在输入昵称 */
            <View className="flex flex-col items-center gap-4 py-2">
              <View className="size-16 rounded-full bg-primary-light flex items-center justify-center overflow-hidden">
                {avatar ? (
                  <AvatarImage src={avatar} className="size-16 rounded-full" mode="aspectFill" />
                ) : (
                  <Image src={iconUser} className="size-8 text-content-tertiary" mode="aspectFit" />
                )}
              </View>
              <Text className="text-paragraph-sm text-content-secondary">设置你的昵称</Text>
              <Input
                type="nickname"
                className="w-full rounded-anthropic-lg border border-line-light px-4 py-2.5 text-paragraph-sm font-body text-center"
                placeholder="点击输入微信昵称"
                focus
                onInput={handleNicknameInput}
                onConfirm={handleNicknameConfirm}
                onBlur={handleNicknameConfirm}
              />
              <Button
                size="md"
                fullWidth={false}
                onClick={handleSaveNickname}
                aria-label="确认昵称"
              >
                确认
              </Button>
            </View>
          ) : (
          /* 未授权：展示授权入口 */
            <TaroButton
              openType="chooseAvatar"
              onChooseAvatar={handleChooseAvatar}
              className="!p-0 !m-0 !bg-transparent !border-0 after:!border-0 w-full"
            >
              <View className="flex flex-col items-center gap-3 py-2">
                <View className="size-16 rounded-full bg-primary-light flex items-center justify-center">
                  <Image src={iconUser} className="size-8 text-content-tertiary" mode="aspectFit" />
                </View>
                <Text className="text-paragraph-sm text-content-tertiary">
                  点击授权微信头像和昵称
                </Text>
                <Text className="text-paragraph-sm text-content-disabled">
                  用于排行榜展示
                </Text>
              </View>
            </TaroButton>
          )}
        </CardContent>
      </Card>

      {/* ── 声音与提醒 ── */}
      <Section variant="group" label="声音与提醒" className="mt-section-gap">
        <List>
          <ListItem
            left={(
              <IconBadge
                variant="neutral"
                icon={<Image src={iconBell} className="size-5" mode="aspectFit" />}
              />
            )}
            title="刷牙提醒"
            description={`每天 ${reminderTime} 提醒你`}
            right={<Switch checked={reminderEnabled} onClick={handleReminderToggle} ariaLabel="刷牙提醒开关" />}
          />
          <ListItem
            left={(
              <IconBadge
                variant="neutral"
                icon={<Image src={iconMusic} className="size-5" mode="aspectFit" />}
              />
            )}
            title="步骤提示音"
            description="步骤切换时播放提示音"
            right={<Switch checked={soundEnabled} onClick={handleSoundToggle} ariaLabel="步骤提示音开关" />}
          />
          <ListItem
            left={(
              <IconBadge
                variant="neutral"
                icon={<Image src={iconVoice} className="size-5" mode="aspectFit" />}
              />
            )}
            title="语音播报"
            description="步骤切换时朗读提示"
            right={<Switch checked={voiceEnabled} onClick={handleVoiceToggle} ariaLabel="语音播报开关" />}
          />
        </List>
      </Section>

      <InPageTabBar current="profile" />
    </PageLayout>
  )
}
