import type { PropsWithChildren } from 'react'
import { StoreProvider } from '@/stores/provider'
import './app.scss'

function App({ children }: PropsWithChildren) {
  return <StoreProvider>{children}</StoreProvider>
}

export default App
