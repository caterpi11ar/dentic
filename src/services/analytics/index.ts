import Taro from '@tarojs/taro'
import { getOpenId } from '@/services/auth'

/** 埋点事件上报（异步，不阻塞主流程） */
export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  try {
    const openid = getOpenId() || ''
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]

    const event = {
      eventName,
      eventTime: Date.now(),
      page: currentPage?.route || '',
      openid,
      ...properties,
    }

    // MVP：写入本地缓冲区，后续可改为云端上报
    const buffer = getEventBuffer()
    buffer.push(event)

    // 缓冲区满时批量上报
    if (buffer.length >= 20) {
      flushEvents(buffer)
    }
    else {
      saveEventBuffer(buffer)
    }
  }
  catch {
    // 埋点不应影响主流程
  }
}

const EVENT_BUFFER_KEY = 'analytics_buffer'

function getEventBuffer(): Record<string, unknown>[] {
  try {
    return (Taro.getStorageSync(EVENT_BUFFER_KEY) as Record<string, unknown>[]) || []
  }
  catch {
    return []
  }
}

function saveEventBuffer(buffer: Record<string, unknown>[]): void {
  try {
    Taro.setStorageSync(EVENT_BUFFER_KEY, buffer)
  }
  catch {
    // 静默处理
  }
}

function flushEvents(_buffer: Record<string, unknown>[]): void {
  // MVP：清空缓冲区，后续接入云端上报
  // TODO: Taro.cloud.callFunction({ name: 'analytics', data: { events: buffer } })
  saveEventBuffer([])
}
