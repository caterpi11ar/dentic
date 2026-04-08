import { callCloudFunction } from '@/services/api'

// ── 类型定义 ──

export interface FamilyMember {
  openId: string
  role: 'creator' | 'member'
  nickname: string
  avatar: string
  joinedAt: number
}

export interface FamilyInfo {
  familyId: string
  name: string
  creatorOpenId: string
  members: FamilyMember[]
}

export interface DayStatus {
  date: string
  morningDone: boolean
  eveningDone: boolean
}

export interface MemberDailyStatus {
  morningDone: boolean
  eveningDone: boolean
  morningTime?: number
  eveningTime?: number
}

export interface DashboardMember {
  openId: string
  nickname: string
  avatar: string
  role: 'creator' | 'member'
  today: MemberDailyStatus
  weekDays: DayStatus[]
}

export interface FamilyDashboard {
  members: DashboardMember[]
  streak: number
}

export interface FamilyInteraction {
  id: string
  type: 'like' | 'reminder'
  fromOpenId: string
  fromNickname: string
  createdAt: number
}

// ── API 调用 ──

export function createFamily(name: string) {
  return callCloudFunction<{ familyId: string }>('family', 'createFamily', {
    name,
  })
}

export function joinFamily(familyId: string) {
  return callCloudFunction<{ familyId: string, alreadyJoined: boolean }>(
    'family',
    'joinFamily',
    { familyId },
  )
}

export function getFamily() {
  return callCloudFunction<FamilyInfo | null>('family', 'getFamily')
}

export function leaveFamily(familyId: string) {
  return callCloudFunction<{ dissolved: boolean }>('family', 'leaveFamily', {
    familyId,
  })
}

export interface FamilyPreview {
  familyId: string
  name: string
  memberCount: number
  creatorNickname: string
}

export function getFamilyPreview(familyId: string) {
  return callCloudFunction<FamilyPreview>('family', 'getFamilyPreview', {
    familyId,
  })
}

export function getDashboard(familyId: string) {
  return callCloudFunction<FamilyDashboard>('family', 'getDashboard', {
    familyId,
  })
}

export function sendInteraction(
  familyId: string,
  type: 'like' | 'reminder',
) {
  return callCloudFunction<{ interactionId: string }>(
    'family',
    'sendInteraction',
    { familyId, type },
  )
}

export function getInteractions(familyId: string) {
  return callCloudFunction<FamilyInteraction[]>(
    'family',
    'getInteractions',
    { familyId },
  )
}
