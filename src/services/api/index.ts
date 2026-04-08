import type { ApiResponse } from '@/types'
import Taro from '@tarojs/taro'

/** 云函数统一调用封装 */
export async function callCloudFunction<T>(
  name: string,
  action: string,
  data?: Record<string, unknown>,
): Promise<T> {
  const res = await Taro.cloud.callFunction({
    name,
    data: { action, ...data },
  })

  const result = res.result as ApiResponse<T>

  if (result.code !== 0) {
    const error = new Error(result.message || '请求失败') as Error & { code: number }
    error.code = result.code
    throw error
  }

  return result.data
}
