import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { StoreConfig } from '@/api/types'
import { DEFAULT_LAYOUT, resolveLayout } from '@/layouts/registry'
import { DEFAULT_THEME, isKnownTheme } from './registry'

const STORAGE_KEY = 'studio'

interface StudioState {
  /** Active theme key (data-theme). */
  theme: string
  /** Active product-list layout key. */
  layout: string
  /** True when the local preview overrides the store's saved config. */
  overridden: boolean
  setTheme: (key: string) => void
  setLayout: (key: string) => void
  reset: () => void
}

const StudioContext = createContext<StudioState | null>(null)

interface Persisted {
  theme?: string
  layout?: string
}

function readPersisted(): Persisted {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export function StudioProvider({
  storeConfig,
  children,
}: {
  storeConfig: StoreConfig | undefined
  children: ReactNode
}) {
  const [override, setOverride] = useState<Persisted>(() => readPersisted())

  const baseTheme = isKnownTheme(storeConfig?.theme?.key)
    ? (storeConfig!.theme!.key as string)
    : DEFAULT_THEME
  const baseLayout = storeConfig?.activeLayout || DEFAULT_LAYOUT

  const theme = isKnownTheme(override.theme) ? (override.theme as string) : baseTheme
  const layout = resolveLayout(override.layout ?? baseLayout).key
  const overridden = Boolean(override.theme || override.layout)

  // Apply theme + any per-store CSS variable overrides to <html>.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const el = document.documentElement
    const vars = storeConfig?.theme?.cssVariables ?? {}
    for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v)
    return () => {
      for (const k of Object.keys(vars)) el.style.removeProperty(k)
    }
  }, [storeConfig?.theme?.cssVariables])

  useEffect(() => {
    if (overridden) localStorage.setItem(STORAGE_KEY, JSON.stringify(override))
    else localStorage.removeItem(STORAGE_KEY)
  }, [override, overridden])

  const setTheme = useCallback((key: string) => setOverride((o) => ({ ...o, theme: key })), [])
  const setLayout = useCallback((key: string) => setOverride((o) => ({ ...o, layout: key })), [])
  const reset = useCallback(() => setOverride({}), [])

  const value = useMemo<StudioState>(
    () => ({ theme, layout, overridden, setTheme, setLayout, reset }),
    [theme, layout, overridden, setTheme, setLayout, reset],
  )

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
}

export function useStudio(): StudioState {
  const ctx = useContext(StudioContext)
  if (!ctx) throw new Error('useStudio must be used within <StudioProvider>')
  return ctx
}
