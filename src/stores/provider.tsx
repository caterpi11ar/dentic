import type { ReactNode } from 'react'
import { AuthProvider } from './auth'
import { ProfileProvider } from './profile'
import { RecordsProvider } from './records'
import { SettingsProvider } from './settings'

export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <RecordsProvider>
        <AuthProvider>
          <ProfileProvider>{children}</ProfileProvider>
        </AuthProvider>
      </RecordsProvider>
    </SettingsProvider>
  )
}
