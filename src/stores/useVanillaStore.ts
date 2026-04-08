import type { StoreApi } from 'zustand/vanilla'
import { useEffect, useRef, useState } from 'react'

/**
 * 手动订阅 zustand/vanilla store 的 React hook。
 * 替代 zustand 的 useStore（在 Taro 微信小程序中不可用）。
 */
export function useVanillaStore<S, T>(
  store: StoreApi<S>,
  selector: (state: S) => T,
): T {
  const selectorRef = useRef(selector)
  selectorRef.current = selector

  const [slice, setSlice] = useState(() => selector(store.getState()))
  const sliceRef = useRef(slice)

  useEffect(() => {
    // hydrate 后同步一次
    const next = selectorRef.current(store.getState())
    if (!Object.is(sliceRef.current, next)) {
      sliceRef.current = next
      setSlice(next)
    }

    return store.subscribe((state) => {
      const nextSlice = selectorRef.current(state)
      if (!Object.is(sliceRef.current, nextSlice)) {
        sliceRef.current = nextSlice
        setSlice(nextSlice)
      }
    })
  }, [store])

  return slice
}
