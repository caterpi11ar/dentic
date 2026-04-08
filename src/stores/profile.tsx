import type { ReactNode } from 'react'
import type { StoreApi } from 'zustand'
import { createContext, useContext } from 'react'
import { createStore, useStore } from 'zustand'
import { persist } from 'zustand/middleware'
import { getProfile, updateProfile } from '@/services/api/userApi'
import { createTaroStorage } from './middleware/taroStorage'

// ── 类型 ──

interface ProfileState {
  nickname: string
  avatar: string
  authorized: boolean
  /** 从云端同步最新资料 */
  fetchProfile: () => Promise<void>
  /** 更新昵称（乐观更新 + API 调用） */
  updateNickname: (name: string) => void
  /** 更新头像（乐观更新 + API 调用） */
  updateAvatar: (url: string) => void
}

type ProfileStore = StoreApi<ProfileState>

// ── Store 工厂 ──

function createProfileStore(): ProfileStore {
  return createStore<ProfileState>()(
    persist(
      set => ({
        nickname: '',
        avatar: '',
        authorized: false,

        fetchProfile: async () => {
          try {
            const profile = await getProfile()
            if (profile.nickname) {
              set({
                nickname: profile.nickname,
                avatar: profile.avatar || '',
                authorized: true,
              })
            }
            else if (profile.avatar) {
              set({ avatar: profile.avatar })
            }
          }
          catch {
            // 静默处理
          }
        },

        updateNickname: (name) => {
          set({ nickname: name, authorized: true })
          updateProfile({ nickname: name }).catch(() => undefined)
        },

        updateAvatar: (url) => {
          set({ avatar: url })
          updateProfile({ avatar: url }).catch(() => undefined)
        },
      }),
      {
        name: 'user_profile_cache',
        storage: createTaroStorage<ProfileState>({
          deserialize: (raw) => {
            if (raw && typeof raw === 'object') {
              const { nickname, avatar } = raw as { nickname?: string, avatar?: string }
              return {
                nickname: nickname || '',
                avatar: avatar || '',
                authorized: !!nickname,
              }
            }
            return { nickname: '', avatar: '', authorized: false }
          },
          serialize: state => ({
            nickname: state.nickname || '',
            avatar: state.avatar || '',
          }),
        }),
      },
    ),
  )
}

// 模块级单例
export const profileStore = createProfileStore()

// ── Context & Provider ──

const ProfileStoreContext = createContext<ProfileStore | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  return (
    <ProfileStoreContext.Provider value={profileStore}>
      {children}
    </ProfileStoreContext.Provider>
  )
}

// ── Hook ──

export function useProfileStore<T>(selector: (state: ProfileState) => T): T {
  const store = useContext(ProfileStoreContext)
  if (!store)
    throw new Error('useProfileStore 必须在 ProfileProvider 内使用')
  return useStore(store, selector)
}
