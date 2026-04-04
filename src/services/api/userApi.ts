import { callCloudFunction } from '@/services/api'

export interface UserProfile {
  openid: string
  nickname: string
  avatar: string
}

/** 获取当前用户资料 */
export function getProfile(): Promise<UserProfile> {
  return callCloudFunction('user', 'getProfile')
}

/** 更新用户资料 */
export function updateProfile(params: {
  nickname?: string
  avatar?: string
}): Promise<{ success: boolean }> {
  return callCloudFunction('user', 'updateProfile', params)
}
