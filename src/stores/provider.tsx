import type { ReactNode } from 'react'
import { ProfileProvider } from './profile'
import { RecordsProvider } from './records'
import { SettingsProvider } from './settings'

export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <RecordsProvider>
        <ProfileProvider>{children}</ProfileProvider>
      </RecordsProvider>
    </SettingsProvider>
  )
}
