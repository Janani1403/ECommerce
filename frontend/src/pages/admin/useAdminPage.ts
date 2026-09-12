import { useEffect, useState } from 'react'
import { useStoreConfig, useUpdateStoreConfig } from '@/api/hooks'
import { LAYOUTS } from '@/layouts/registry'
import { THEMES } from '@/theme/registry'

export function useAdminPage() {
  const { data: config, isLoading } = useStoreConfig()
  const update = useUpdateStoreConfig()

  const savedTheme = config?.theme?.key ?? null
  const savedLayout = config?.activeLayout ?? null

  const [theme, setTheme] = useState<string | null>(null)
  const [layout, setLayout] = useState<string | null>(null)

  // Seed local selection from the saved config once it arrives.
  useEffect(() => {
    if (savedTheme && theme === null) setTheme(savedTheme)
  }, [savedTheme, theme])
  useEffect(() => {
    if (savedLayout && layout === null) setLayout(savedLayout)
  }, [savedLayout, layout])

  const dirty = Boolean(
    (theme && theme !== savedTheme) || (layout && layout !== savedLayout),
  )

  function save() {
    update.mutate({ themeKey: theme ?? undefined, layout: layout ?? undefined })
  }

  return {
    isLoading,
    themes: THEMES,
    layouts: LAYOUTS,
    theme,
    layout,
    selectTheme: setTheme,
    selectLayout: setLayout,
    dirty,
    save,
    isSaving: update.isPending,
    justSaved: update.isSuccess && !dirty,
    error: update.isError ? (update.error as Error) : null,
  }
}
