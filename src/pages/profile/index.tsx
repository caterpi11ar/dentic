import { useEffect, useState } from 'react'
import { View, Text, Input, Button as TaroButton, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { getSettings, saveSettings } from '@/services/settingsStorage'
import { getProfile, updateProfile } from '@/services/api/userApi'
import { applyLightThemeToChrome } from '@/services/theme'
import InPageTabBar from '@/components/InPageTabBar'
import PageLayout from '@/components/PageLayout'
import { Card, CardContent } from '@/components/ui/Card'
import Switch from '@/components/ui/Switch'
import iconBell from '@/assets/icons/icon-bell.svg'
import iconMusic from '@/assets/icons/icon-music.svg'
import iconVoice from '@/assets/icons/icon-voice.svg'
import iconUser from '@/assets/icons/icon-user.svg'
import type { UserSettings } from '@/types'

const PROFILE_CACHE_KEY = 'user_profile_cache'

function getCachedProfile(): { nickname: string; avatar: string } | null {
  try {
    const cached = Taro.getStorageSync(PROFILE_CACHE_KEY)
    return cached && cached.nickname ? cached : null
  } catch {
    return null
  }
}

function setCachedProfile(nickname: string, avatar: string): void {
  try {
    Taro.setStorageSync(PROFILE_CACHE_KEY, { nickname, avatar })
  } catch {
    // 静默处理
  }
}

export default function ProfilePage() {
  const [settings, setSettings] = useState<UserSettings>(getSettings)

  // 优先从本地缓存初始化，避免闪烁
  const cached = getCachedProfile()
  const [nickname, setNickname] = useState(cached?.nickname || '')
  const [avatar, setAvatar] = useState(cached?.avatar || '')
  const [authorized, setAuthorized] = useState(!!cached?.nickname)
  const [showNicknameInput, setShowNicknameInput] = useState(false)

  useEffect(() => {
    // 首次挂载从云端同步最新资料
    getProfile()
      .then((profile) => {
        if (profile.nickname) {
          setNickname(profile.nickname)
          setAuthorized(true)
        }
        if (profile.avatar) setAvatar(profile.avatar)
        if (profile.nickname || profile.avatar) {
          setCachedProfile(profile.nickname || nickname, profile.avatar || avatar)
        }
      })
      .catch(() => undefined)
  }, [])

  useDidShow(() => {
    applyLightThemeToChrome()
    setSettings(getSettings())
    // 每次进入页面都刷新云端头像
    getProfile()
      .then((profile) => {
        if (profile.nickname) {
          setNickname(profile.nickname)
          setAuthorized(true)
        }
        if (profile.avatar) setAvatar(profile.avatar)
        if (profile.nickname || profile.avatar) {
          setCachedProfile(profile.nickname || nickname, profile.avatar || avatar)
        }
      })
      .catch(() => undefined)
  })

  // 第一步：选择头像后，自动弹出昵称输入
  const handleChooseAvatar = (e) => {
    const tempUrl = e?.detail?.avatarUrl
    if (!tempUrl) return

    // 先用临时路径预览，再后台上传云存储
    setAvatar(tempUrl)
    setShowNicknameInput(true)

    const cloudPath = `avatars/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
    Taro.cloud
      .uploadFile({ cloudPath, filePath: tempUrl })
      .then((res) => {
        const fileID = res.fileID
        setAvatar(fileID)
        setCachedProfile(nickname, fileID)
        updateProfile({ avatar: fileID }).catch(() => undefined)
      })
      .catch(() => {
        setCachedProfile(nickname, tempUrl)
        updateProfile({ avatar: tempUrl }).catch(() => undefined)
      })
  }

  // 第二步：昵称输入变化时暂存
  const [tempNickname, setTempNickname] = useState('')

  const handleNicknameInput = (e) => {
    const value = e?.detail?.value || ''
    setTempNickname(value)
  }

  // 昵称确认（onBlur/onConfirm 或点击确认按钮）
  const handleNicknameConfirm = (e) => {
    const value = (e?.detail?.value || tempNickname || '').trim()
    if (value) {
      setNickname(value)
      setAuthorized(true)
      setShowNicknameInput(false)
      updateProfile({ nickname: value }).catch(() => undefined)
      Taro.showToast({ title: '设置成功', icon: 'success', duration: 1000 }).catch(() => undefined)
    }
  }

  const handleSaveNickname = () => {
    const value = tempNickname.trim()
    if (value) {
      setNickname(value)
      setAuthorized(true)
      setShowNicknameInput(false)
      setCachedProfile(value, avatar)
      updateProfile({ nickname: value }).catch(() => undefined)
      Taro.showToast({ title: '设置成功', icon: 'success', duration: 1000 }).catch(() => undefined)
    } else {
      Taro.showToast({ title: '请输入昵称', icon: 'none' }).catch(() => undefined)
    }
  }

  const handleReminderToggle = () => {
    if (!settings.reminderEnabled) {
      Taro.showModal({
        title: '设置提醒',
        content: `当前版本暂不支持自动推送提醒。\n\n建议您在手机闹钟中设置每天 ${settings.reminderTime} 的刷牙提醒。`,
        showCancel: false,
        confirmText: '我知道了',
      })
    }
    const updated = { ...settings, reminderEnabled: !settings.reminderEnabled }
    setSettings(updated)
    saveSettings({ reminderEnabled: updated.reminderEnabled })
  }

  const handleSoundToggle = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled }
    setSettings(updated)
    saveSettings({ soundEnabled: updated.soundEnabled })
  }

  const handleVoiceToggle = () => {
    const updated = { ...settings, voiceEnabled: !settings.voiceEnabled }
    setSettings(updated)
    saveSettings({ voiceEnabled: updated.voiceEnabled })
  }

  return (
    <PageLayout scroll>
        <Text className="text-display-md font-body font-medium tracking-tight text-content">
          我的
        </Text>

        {/* ── 用户信息卡片 ── */}
        <Card className="mt-6 rounded-anthropic">
          <CardContent>
            {authorized && !showNicknameInput ? (
              /* 已授权：展示头像和昵称，点击可重新设置 */
              <TaroButton
                openType="chooseAvatar"
                onChooseAvatar={handleChooseAvatar}
                className="!p-0 !m-0 !bg-transparent !border-0 !leading-none after:!border-0 w-full"
              >
                <View className="flex items-center gap-4">
                  <View className="size-14 rounded-full bg-primary-light flex items-center justify-center overflow-hidden flex-shrink-0">
                    {avatar ? (
                      <Image src={avatar} className="size-14 rounded-full" mode="aspectFill" />
                    ) : (
                      <Text className="text-xl font-heading font-semibold text-primary">
                        {nickname.slice(0, 1)}
                      </Text>
                    )}
                  </View>
                  <View className="flex-1 min-w-0 text-left">
                    <Text className="text-paragraph-md font-heading font-semibold text-content truncate">
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
                    <Image src={avatar} className="size-16 rounded-full" mode="aspectFill" />
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
                <View
                  className="rounded-anthropic bg-primary px-6 py-3 active:opacity-85"
                  role="button"
                  onClick={handleSaveNickname}
                  aria-label="确认昵称"
                >
                  <Text className="text-paragraph-sm font-heading font-semibold text-surface-white">确认</Text>
                </View>
              </View>
            ) : (
              /* 未授权：展示授权入口 */
              <TaroButton
                openType="chooseAvatar"
                onChooseAvatar={handleChooseAvatar}
                className="!p-0 !m-0 !bg-transparent !border-0 !leading-none after:!border-0 w-full"
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
        <View className="mt-12 flex items-center gap-3">
          <Text className="text-label-sm font-heading font-semibold tracking-[0.1em] uppercase text-content-tertiary shrink-0">
            声音与提醒
          </Text>
          <View className="flex-1 h-px bg-line" />
        </View>

        <Card className="mt-5 overflow-hidden rounded-anthropic">
          <CardContent className="p-0 divide-y divide-line">
            <View className="flex items-center justify-between gap-4 px-5 py-4">
              <View className="flex items-start gap-3 flex-1 min-w-0">
                <View className="size-9 rounded-anthropic-sm border border-warning/20 bg-warning-light/75 flex items-center justify-center">
                  <Image src={iconBell} className="size-5 text-content-secondary" mode="aspectFit" />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="block text-paragraph-sm font-heading font-semibold text-content">刷牙提醒</Text>
                  <Text className="block mt-1 text-label-sm text-content-tertiary">每天 {settings.reminderTime} 提醒你</Text>
                </View>
              </View>
              <View className="shrink-0">
                <Switch checked={settings.reminderEnabled} onClick={handleReminderToggle} ariaLabel="刷牙提醒开关" />
              </View>
            </View>

            <View className="flex items-center justify-between gap-4 px-5 py-4">
              <View className="flex items-start gap-3 flex-1 min-w-0">
                <View className="size-9 rounded-anthropic-sm border border-info/20 bg-info-light/80 flex items-center justify-center">
                  <Image src={iconMusic} className="size-5 text-content-secondary" mode="aspectFit" />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="block text-paragraph-sm font-heading font-semibold text-content">步骤提示音</Text>
                  <Text className="block mt-1 text-label-sm text-content-tertiary">步骤切换时播放提示音</Text>
                </View>
              </View>
              <View className="shrink-0">
                <Switch checked={settings.soundEnabled} onClick={handleSoundToggle} ariaLabel="步骤提示音开关" />
              </View>
            </View>

            <View className="flex items-center justify-between gap-4 px-5 py-4">
              <View className="flex items-start gap-3 flex-1 min-w-0">
                <View className="size-9 rounded-anthropic-sm border border-success/20 bg-success-light/80 flex items-center justify-center">
                  <Image src={iconVoice} className="size-5 text-content-secondary" mode="aspectFit" />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="block text-paragraph-sm font-heading font-semibold text-content">语音播报</Text>
                  <Text className="block mt-1 text-label-sm text-content-tertiary">步骤切换时朗读提示</Text>
                </View>
              </View>
              <View className="shrink-0">
                <Switch checked={settings.voiceEnabled} onClick={handleVoiceToggle} ariaLabel="语音播报开关" />
              </View>
            </View>
          </CardContent>
        </Card>

      <InPageTabBar current="profile" />
    </PageLayout>
  )
}
