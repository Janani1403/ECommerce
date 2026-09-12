import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { queryClient } from './queryClient'
import { StoreProviders } from './StoreProviders'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <StoreProviders>{children}</StoreProviders>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
