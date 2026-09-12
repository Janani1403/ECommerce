import { Link } from 'react-router-dom'
import { CONTENT } from '@/constants/content'
import { ROUTES } from '@/constants/routes'
import { LayoutPreviewCard } from '@/components/admin/LayoutPreviewCard'
import { ThemePreviewCard } from '@/components/admin/ThemePreviewCard'
import { DEFAULT_THEME } from '@/theme/registry'
import { useAdminPage } from './useAdminPage'
import './AdminPage.css'

export function AdminPage() {
  const {
    isLoading, themes, layouts, theme, layout,
    selectTheme, selectLayout, dirty, save, isSaving, justSaved, error,
  } = useAdminPage()

  if (isLoading) return <div className="section container">Loading…</div>

  return (
    <div className="admin section container" data-theme={DEFAULT_THEME}>
      <header className="admin__head">
        <div>
          <p className="eyebrow">{CONTENT.admin.eyebrow}</p>
          <h1>{CONTENT.admin.title}</h1>
        </div>
        <div className="admin__head-actions">
          <Link to={ROUTES.adminImport} className="btn btn--ghost">
            {CONTENT.admin.importLink}
          </Link>
          <Link to={ROUTES.home} className="btn btn--ghost">
            {CONTENT.admin.viewStore}
          </Link>
        </div>
      </header>
      <p className="admin__note">{CONTENT.admin.note}</p>

      <section className="admin__group">
        <h2>{CONTENT.admin.themeHeading}</h2>
        <div className="pick-grid">
          {themes.map((t) => (
            <ThemePreviewCard
              key={t.key}
              themeKey={t.key}
              label={t.label}
              selected={theme === t.key}
              onSelect={() => selectTheme(t.key)}
            />
          ))}
        </div>
      </section>

      <section className="admin__group">
        <h2>{CONTENT.admin.layoutHeading}</h2>
        <div className="pick-grid">
          {layouts.map((l) => (
            <LayoutPreviewCard
              key={l.key}
              layoutKey={l.key}
              label={l.label}
              description={l.description}
              selected={layout === l.key}
              onSelect={() => selectLayout(l.key)}
            />
          ))}
        </div>
      </section>

      <div className="admin__save-bar">
        <span className="admin__status">
          {justSaved ? CONTENT.admin.saved : dirty ? CONTENT.admin.dirty : CONTENT.admin.clean}
          {error && <span className="admin__error"> — {error.message}</span>}
        </span>
        <button className="btn" disabled={!dirty || isSaving} onClick={save}>
          {isSaving ? CONTENT.admin.saving : CONTENT.admin.save}
        </button>
      </div>
    </div>
  )
}
