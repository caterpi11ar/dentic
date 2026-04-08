import type { ReactNode } from 'react'
import { createContext } from 'react'
import { persist } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'
import { getProfile, updateProfile } from '@/services/api/userApi'
import { createTaroStorage } from './middleware/taroStorage'
import { useVanillaStore } from './useVanillaStore'

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

// ── Store ──

export const profileStore = createStore<ProfileState>()(
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

// ── Context & Provider ──

const ProfileStoreContext = createContext(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  return (
    <ProfileStoreContext.Provider value={null}>
      {children}
    </ProfileStoreContext.Provider>
  )
}

// ── Hook ──

export function useProfileStore<T>(selector: (state: ProfileState) => T): T {
  return useVanillaStore(profileStore, selector)
}
