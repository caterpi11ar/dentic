import { authStore } from '@/stores/auth'

/** 从缓存获取 openid（同步） */
export function getOpenId(): string | null {
  return authStore.getState().openId
}

/** 确保登录并返回 openid，未登录时触发云端获取 */
export async function ensureLogin(): Promise<string> {
  return authStore.getState().ensureLogin()
}

/** 清除认证缓存 */
export function clearAuth(): void {
  authStore.getState().clearAuth()
}
