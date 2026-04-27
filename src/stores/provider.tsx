import type { ReactNode } from 'react'
import { AchievementsProvider } from './achievements'
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
            <FamilyProvider>
              <AchievementsProvider>{children}</AchievementsProvider>
            </FamilyProvider>
          </ProfileProvider>
        </AuthProvider>
      </RecordsProvider>
    </SettingsProvider>
  )
}
