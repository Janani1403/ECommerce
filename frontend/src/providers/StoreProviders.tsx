import type { ReactNode } from 'react'
import { useStoreConfig } from '@/api/hooks'
import { CartProvider } from './CartProvider'
import { StudioProvider } from './StudioProvider'

/** Fetches store config once, then provides Studio (theme/layout) + Cart context. */
export function StoreProviders({ children }: { children: ReactNode }) {
  const { data: storeConfig } = useStoreConfig()
  return (
    <StudioProvider storeConfig={storeConfig}>
      <CartProvider>{children}</CartProvider>
    </StudioProvider>
  )
}
