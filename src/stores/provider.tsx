import type { ReactNode } from 'react'
import { AuthProvider } from './auth'
import { FamilyProvider } from './family'
import { ProfileProvider } from './profile'
import { RecordsProvider } from './records'
import { SettingsProvider } from './settings'

export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <RecordsProvider>
        <AuthProvider>
          <ProfileProvider>
            <FamilyProvider>{children}</FamilyProvider>
          </ProfileProvider>
        </AuthProvider>
      </RecordsProvider>
    </SettingsProvider>
  )
}
