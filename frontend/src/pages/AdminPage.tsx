import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStoreConfig, useUpdateStoreConfig } from '@/api/queries'
import { LayoutPreviewCard } from '@/components/LayoutPreviewCard'
import { ThemePreviewCard } from '@/components/ThemePreviewCard'
import { LAYOUTS } from '@/layouts/registry'
import { THEMES } from '@/theme/registry'
import './admin.css'

export function AdminPage() {
  const { data: config, isLoading } = useStoreConfig()
  const update = useUpdateStoreConfig()

  const savedTheme = config?.theme?.key ?? null
  const savedLayout = config?.activeLayout ?? null

  const [theme, setTheme] = useState<string | null>(null)
  const [layout, setLayout] = useState<string | null>(null)

  // Seed the local selection from the saved config once it arrives.
  useEffect(() => {
    if (savedTheme && theme === null) setTheme(savedTheme)
  }, [savedTheme, theme])
  useEffect(() => {
    if (savedLayout && layout === null) setLayout(savedLayout)
  }, [savedLayout, layout])

  const dirty = (theme && theme !== savedTheme) || (layout && layout !== savedLayout)

  function save() {
    update.mutate({
      themeKey: theme ?? undefined,
      layout: layout ?? undefined,
    })
  }

  if (isLoading) return <div className="section container">Loading…</div>

  return (
    <div className="admin section container" data-theme="lavender-mist">
      <header className="admin__head">
        <div>
          <p className="eyebrow">Store settings</p>
          <h1>Appearance</h1>
        </div>
        <Link to="/" className="btn btn--ghost">
          View store
        </Link>
      </header>
      <p className="admin__note">
        Changes are saved to <code>store_config</code> in the database and take effect for every
        visitor. Each write is recorded in <code>audit_log</code>.
      </p>

      <section className="admin__group">
        <h2>Theme</h2>
        <div className="pick-grid">
          {THEMES.map((t) => (
            <ThemePreviewCard
              key={t.key}
              themeKey={t.key}
              label={t.label}
              selected={theme === t.key}
              onSelect={() => setTheme(t.key)}
            />
          ))}
        </div>
      </section>

      <section className="admin__group">
        <h2>Product &amp; home layout</h2>
        <div className="pick-grid">
          {LAYOUTS.map((l) => (
            <LayoutPreviewCard
              key={l.key}
              layoutKey={l.key}
              label={l.label}
              description={l.description}
              selected={layout === l.key}
              onSelect={() => setLayout(l.key)}
            />
          ))}
        </div>
      </section>

      <div className="admin__save-bar">
        <span className="admin__status">
          {update.isSuccess && !dirty
            ? 'Saved.'
            : dirty
              ? 'Unsaved changes'
              : 'Everything matches the saved config'}
          {update.isError && (
            <span className="admin__error"> — {(update.error as Error).message}</span>
          )}
        </span>
        <button
          className="btn"
          disabled={!dirty || update.isPending}
          onClick={save}
        >
          {update.isPending ? 'Saving…' : 'Save to store'}
        </button>
      </div>
    </div>
  )
}
