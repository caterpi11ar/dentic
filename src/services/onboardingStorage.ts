import Taro from '@tarojs/taro'

const ONBOARDING_STORAGE_KEY = 'onboarding_seen'

export function hasSeenOnboarding(): boolean {
  try {
    return !!Taro.getStorageSync(ONBOARDING_STORAGE_KEY)
  }
  catch {
    return false
  }
}

export function markOnboardingSeen(): void {
  Taro.setStorageSync(ONBOARDING_STORAGE_KEY, true)
}
