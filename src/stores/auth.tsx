import type { ReactNode } from 'react'
import Taro from '@tarojs/taro'
import { createContext } from 'react'
import { persist } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'
import { createTaroStorage } from './middleware/taroStorage'
import { useVanillaStore } from './useVanillaStore'

// ── 类型 ──

interface AuthState {
  openId: string | null
  /** 确保登录并返回 openid，未登录时触发云端获取 */
  ensureLogin: () => Promise<string>
  /** 清除认证缓存 */
  clearAuth: () => void
}

// ── Store ──

export const authStore = createStore<AuthState>()(
  persist(
    (set, get) => ({
      openId: null,

      ensureLogin: async () => {
        const existing = get().openId
        if (existing)
          return existing

        try {
          const res = await Taro.cloud.callFunction({
            name: 'user',
            data: { action: 'getOpenId' },
          })
          const result = res.result as { code: number, data: { openid: string } }

          if (result.code === 0 && result.data?.openid) {
            set({ openId: result.data.openid })
            return result.data.openid
          }

          const loginRes = await Taro.login()
          if (loginRes.code) {
            await Taro.cloud.callFunction({
              name: 'user',
              data: { action: 'updateRankVisibility', rankVisibility: 'public' },
            })
            const profileRes = await Taro.cloud.callFunction({
              name: 'user',
              data: { action: 'getOpenId' },
            })
            const profileResult = profileRes.result as {
              code: number
              data: { openid: string }
            }
            if (profileResult?.data?.openid) {
              set({ openId: profileResult.data.openid })
              return profileResult.data.openid
            }
          }
        }
        catch {
          // 静默处理
        }

        throw new Error('登录失败，无法获取用户标识')
      },

      clearAuth: () => {
        set({ openId: null })
      },
    }),
    {
      name: 'auth_openid',
      storage: createTaroStorage<AuthState>({
        deserialize: (raw) => {
          // 旧格式存的是纯 string
          if (typeof raw === 'string')
            return { openId: raw }
          if (raw && typeof raw === 'object' && 'openId' in raw) {
            return { openId: (raw as { openId: string }).openId }
          }
          return { openId: null }
        },
        serialize: state => state.openId ?? null,
      }),
    },
  ),
)

// ── Context & Provider ──

const AuthStoreContext = createContext(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthStoreContext.Provider value={null}>
      {children}
    </AuthStoreContext.Provider>
  )
}

// ── Hook ──

export function useAuthStore<T>(selector: (state: AuthState) => T): T {
  return useVanillaStore(authStore, selector)
}
