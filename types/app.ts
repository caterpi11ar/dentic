export interface DayRecord {
  date: string // ISO date string YYYY-MM-DD
  am: boolean
  pm: boolean
}

export interface AppState {
  streakDays: number
  todayAm: boolean
  todayPm: boolean
  weekHistory: DayRecord[]
}
