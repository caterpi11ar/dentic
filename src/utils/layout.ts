import Taro from '@tarojs/taro'

const DEFAULT_STATUS_BAR_HEIGHT = 20
const DEFAULT_NAV_CONTENT_HEIGHT = 40
let cachedStatusBarHeight: number | null = null

export function getStatusBarHeight(): number {
  if (cachedStatusBarHeight !== null) {
    return cachedStatusBarHeight
  }

  try {
    const systemInfo = Taro.getSystemInfoSync()
    const statusBarHeight = Number(systemInfo.statusBarHeight)
    if (Number.isFinite(statusBarHeight) && statusBarHeight > 0) {
      cachedStatusBarHeight = statusBarHeight
      return statusBarHeight
    }
  }
  catch {
    // Ignore and fall back to default.
  }

  cachedStatusBarHeight = DEFAULT_STATUS_BAR_HEIGHT
  return cachedStatusBarHeight
}

export function getPageTopPadding(extra = 10): string {
  const statusBarHeight = getStatusBarHeight()
  let navBottom = statusBarHeight + DEFAULT_NAV_CONTENT_HEIGHT

  try {
    const rect = Taro.getMenuButtonBoundingClientRect?.()
    const menuBottom = Number(rect?.bottom)
    if (Number.isFinite(menuBottom) && menuBottom > 0) {
      navBottom = Math.max(navBottom, menuBottom)
    }
  }
  catch {
    // Ignore and use default nav bottom.
  }

  return `${Math.round(navBottom + extra)}px`
}
