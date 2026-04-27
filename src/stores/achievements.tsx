import type { ReactNode } from 'react'
import { createContext } from 'react'
import { persist } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'
import { createTaroStorage } from './middleware/taroStorage'
import { useVanillaStore } from './useVanillaStore'

// ── 类型 ──

export interface UnlockedAchievement {
  id: string
  unlockedAt: number
}

export interface TipHistory {
  /** 最近展示过的 tip id（FIFO，用于跨日避免重复） */
  lastShownIds: string[]
  /** 上次展示日期（业务日 YYYY-MM-DD），同日命中缓存 */
  lastShownDate: string
  /** 上次展示的 tip id（同日重复进入完成态时保持一致） */
  lastShownTipId: string | null
}

interface AchievementsState {
  unlocked: UnlockedAchievement[]
  cheersSent: number
  tipHistory: TipHistory
  /** 合并新解锁集合，返回本次真正新增的 id 数组（按传入顺序） */
  mergeUnlocked: (snapshot: Set<string>) => string[]
  incrementCheersSent: () => void
  /** 落盘本次展示的 tip，最多保留最近 7 条 */
  commitTipShown: (date: string, tipId: string) => void
}

// ── 存储 ──

const ACHIEVEMENTS_STORAGE_KEY = 'achievements_state'
const TIP_HISTORY_MAX = 7

function migrate(raw: unknown): Partial<AchievementsState> {
  if (!raw || typeof raw !== 'object')
    return {}
  const source = raw as Record<string, unknown>

  const unlocked: UnlockedAchievement[] = Array.isArray(source.unlocked)
    ? (source.unlocked as unknown[])
        .map((item) => {
          if (!item || typeof item !== 'object')
            return null
          const entry = item as { id?: unknown, unlockedAt?: unknown }
          if (typeof entry.id !== 'string' || typeof entry.unlockedAt !== 'number')
            return null
          return { id: entry.id, unlockedAt: entry.unlockedAt }
        })
        .filter((entry): entry is UnlockedAchievement => entry !== null)
    : []

  const cheersSent = typeof source.cheersSent === 'number' ? source.cheersSent : 0

  const tipHistoryRaw = source.tipHistory as Record<string, unknown> | undefined
  const tipHistory: TipHistory = tipHistoryRaw
    ? {
        lastShownIds: Array.isArray(tipHistoryRaw.lastShownIds)
          ? (tipHistoryRaw.lastShownIds as unknown[]).filter((v): v is string => typeof v === 'string')
          : [],
        lastShownDate: typeof tipHistoryRaw.lastShownDate === 'string' ? tipHistoryRaw.lastShownDate : '',
        lastShownTipId: typeof tipHistoryRaw.lastShownTipId === 'string' ? tipHistoryRaw.lastShownTipId : null,
      }
    : { lastShownIds: [], lastShownDate: '', lastShownTipId: null }

  return { unlocked, cheersSent, tipHistory }
}

function serialize(state: Partial<AchievementsState>) {
  return {
    unlocked: state.unlocked ?? [],
    cheersSent: state.cheersSent ?? 0,
    tipHistory: state.tipHistory ?? { lastShownIds: [], lastShownDate: '', lastShownTipId: null },
  }
}

// ── Store ──

export const achievementsStore = createStore<AchievementsState>()(
  persist(
    (set, get) => ({
      unlocked: [],
      cheersSent: 0,
      tipHistory: { lastShownIds: [], lastShownDate: '', lastShownTipId: null },

      mergeUnlocked: (snapshot) => {
        const existing = new Set(get().unlocked.map(entry => entry.id))
        const added: string[] = []
        const now = Date.now()
        const next = [...get().unlocked]
        snapshot.forEach((id) => {
          if (!existing.has(id)) {
            next.push({ id, unlockedAt: now })
            added.push(id)
          }
        })
        if (added.length > 0)
          set({ unlocked: next })
        return added
      },

      incrementCheersSent: () => {
        set({ cheersSent: get().cheersSent + 1 })
      },

      commitTipShown: (date, tipId) => {
        const prev = get().tipHistory
        const nextIds = [tipId, ...prev.lastShownIds.filter(id => id !== tipId)].slice(0, TIP_HISTORY_MAX)
        set({
          tipHistory: {
            lastShownIds: nextIds,
            lastShownDate: date,
            lastShownTipId: tipId,
          },
        })
      },
    }),
    {
      name: ACHIEVEMENTS_STORAGE_KEY,
      storage: createTaroStorage<AchievementsState>({
        deserialize: migrate,
        serialize,
      }),
    },
  ),
)

// ── Context & Provider ──

const AchievementsStoreContext = createContext(null)

export function AchievementsProvider({ children }: { children: ReactNode }) {
  return (
    <AchievementsStoreContext.Provider value={null}>
      {children}
    </AchievementsStoreContext.Provider>
  )
}

// ── Hook ──

export function useAchievementsStore<T>(selector: (state: AchievementsState) => T): T {
  return useVanillaStore(achievementsStore, selector)
}
