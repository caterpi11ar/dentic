import type { PersistStorage, StorageValue } from 'zustand/middleware'
import Taro from '@tarojs/taro'

/**
 * 创建 Zustand persist 中间件的 Taro 存储适配器
 *
 * @param options
 * @param options.serialize - 将 state 转换为 Taro 存储格式（可选）
 * @param options.deserialize - 将 Taro 存储值还原为 state（可选）
 */
export function createTaroStorage<T>(options?: {
  serialize?: (state: Partial<T>) => unknown
  deserialize?: (raw: unknown) => Partial<T>
}): PersistStorage<T> {
  const serialize = options?.serialize ?? ((state: Partial<T>) => state)
  const deserialize = options?.deserialize ?? ((raw: unknown) => raw as Partial<T>)

  return {
    getItem(name: string): StorageValue<T> | null {
      try {
        const raw = Taro.getStorageSync(name)
        if (raw === '' || raw === undefined || raw === null)
          return null
        return { state: deserialize(raw) as T }
      }
      catch {
        return null
      }
    },

    setItem(name: string, value: StorageValue<T>): void {
      try {
        Taro.setStorageSync(name, serialize(value.state))
      }
      catch {
        // 静默处理
      }
    },

    removeItem(name: string): void {
      try {
        Taro.removeStorageSync(name)
      }
      catch {
        // 静默处理
      }
    },
  }
}
