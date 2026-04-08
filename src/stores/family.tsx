import type { ReactNode } from 'react'
import type {
  FamilyDashboard,
  FamilyInfo,
  FamilyInteraction,
} from '@/services/api/familyApi'
import { createContext } from 'react'
import { persist } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'
import * as familyApi from '@/services/api/familyApi'
import { createTaroStorage } from './middleware/taroStorage'
import { useVanillaStore } from './useVanillaStore'

// ── 类型 ──

interface FamilyState {
  family: FamilyInfo | null
  dashboard: FamilyDashboard | null
  interactions: FamilyInteraction[]
  loading: boolean
  fetchFamily: () => Promise<FamilyInfo | null>
  fetchDashboard: () => Promise<void>
  fetchInteractions: () => Promise<void>
  createFamily: (name: string) => Promise<string>
  joinFamily: (familyId: string) => Promise<void>
  leaveFamily: () => Promise<void>
  sendInteraction: (type: 'like' | 'reminder') => Promise<void>
  clearFamily: () => void
}

// ── Vanilla Store（不依赖 React） ──

export const familyStore = createStore<FamilyState>()(
  persist(
    (set, get) => ({
      family: null,
      dashboard: null,
      interactions: [],
      loading: false,

      fetchFamily: async () => {
        set({ loading: true })
        try {
          const info = await familyApi.getFamily()
          set({ family: info, loading: false })
          return info
        }
        catch {
          set({ loading: false })
          return null
        }
      },

      fetchDashboard: async () => {
        const { family } = get()
        if (!family)
          return
        try {
          const data = await familyApi.getDashboard(family.familyId)
          set({ dashboard: data })
        }
        catch {
          // 静默处理
        }
      },

      fetchInteractions: async () => {
        const { family } = get()
        if (!family)
          return
        try {
          const list = await familyApi.getInteractions(family.familyId)
          set({ interactions: list })
        }
        catch {
          // 静默处理
        }
      },

      createFamily: async (name) => {
        const { familyId } = await familyApi.createFamily(name)
        const info = await familyApi.getFamily()
        set({ family: info })
        return familyId
      },

      joinFamily: async (familyId) => {
        await familyApi.joinFamily(familyId)
        const info = await familyApi.getFamily()
        set({ family: info })
      },

      leaveFamily: async () => {
        const { family } = get()
        if (!family)
          return
        await familyApi.leaveFamily(family.familyId)
        set({ family: null, dashboard: null, interactions: [] })
      },

      sendInteraction: async (type) => {
        const { family } = get()
        if (!family)
          return
        await familyApi.sendInteraction(family.familyId, type)
        const list = await familyApi.getInteractions(family.familyId)
        set({ interactions: list })
      },

      clearFamily: () => {
        set({ family: null, dashboard: null, interactions: [] })
      },
    }),
    {
      name: 'family_cache',
      storage: createTaroStorage<FamilyState>({
        deserialize: (raw) => {
          if (raw && typeof raw === 'object' && 'family' in raw) {
            return { family: (raw as { family: FamilyInfo | null }).family }
          }
          return { family: null }
        },
        serialize: ({ family }) => ({ family }),
      }),
    },
  ),
)

// ── Hook（手动订阅 vanilla store，不依赖 zustand 的 React 绑定） ──

export function useFamilyStore<T>(selector: (state: FamilyState) => T): T {
  return useVanillaStore(familyStore, selector)
}

// ── Provider（保持接口兼容） ──

const FamilyStoreContext = createContext(null)

export function FamilyProvider({ children }: { children: ReactNode }) {
  return (
    <FamilyStoreContext.Provider value={null}>
      {children}
    </FamilyStoreContext.Provider>
  )
}
