import Taro from '@tarojs/taro'

const AUTH_STORAGE_KEY = 'auth_openid'

// 内存缓存
let cachedOpenId: string | null = null

/** 从缓存获取 openid（同步） */
export function getOpenId(): string | null {
  if (cachedOpenId) return cachedOpenId

  try {
    const stored = Taro.getStorageSync(AUTH_STORAGE_KEY) as string
    if (stored) {
      cachedOpenId = stored
      return stored
    }
  } catch {
    // 静默处理
  }

  return null
}

/** 确保登录并返回 openid，未登录时触发云端获取 */
export async function ensureLogin(): Promise<string> {
  const existing = getOpenId()
  if (existing) return existing

  try {
    // 通过云函数获取 openid
    const res = await Taro.cloud.callFunction({ name: 'user', data: { action: 'getOpenId' } })
    const result = res.result as { code: number; data: { openid: string } }

    if (result.code === 0 && result.data?.openid) {
      cachedOpenId = result.data.openid
      Taro.setStorageSync(AUTH_STORAGE_KEY, cachedOpenId)
      return cachedOpenId
    }

    // 云函数无此 action 时，通过微信登录获取
    const loginRes = await Taro.login()
    if (loginRes.code) {
      // 微信云开发环境下，云函数可通过 getWXContext 获取 openid
      // 这里使用一个轻量云函数触发获取
      await Taro.cloud.callFunction({
        name: 'user',
        data: { action: 'updateRankVisibility', rankVisibility: 'public' },
      })
      // 云函数执行后 openid 已存入 user_profile
      // 再次尝试获取
      const profileRes = await Taro.cloud.callFunction({ name: 'user', data: { action: 'getOpenId' } })
      const profileResult = profileRes.result as { code: number; data: { openid: string } }
      if (profileResult?.data?.openid) {
        cachedOpenId = profileResult.data.openid
        Taro.setStorageSync(AUTH_STORAGE_KEY, cachedOpenId)
        return cachedOpenId
      }
    }
  } catch {
    // 静默处理
  }

  throw new Error('登录失败，无法获取用户标识')
}

/** 清除认证缓存 */
export function clearAuth(): void {
  cachedOpenId = null
  try {
    Taro.removeStorageSync(AUTH_STORAGE_KEY)
  } catch {
    // 静默处理
  }
}
