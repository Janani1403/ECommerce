import { useState } from 'react'
import { LAYOUTS } from '@/layouts/registry'
import { THEMES } from '@/theme/registry'
import { useStudio } from '@/theme/StudioProvider'
import './studio-panel.css'

/**
 * Floating preview switcher: pick any of the 5 themes x 5 layouts without
 * touching the database. Doubles as the seed of the template picker for the
 * site-builder use case. Shown in dev, or when VITE_ENABLE_STUDIO=true.
 */
export function StudioPanel() {
  const { theme, layout, overridden, setTheme, setLayout, reset } = useStudio()
  const [open, setOpen] = useState(false)

  const enabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_STUDIO === 'true'
  if (!enabled) return null

  return (
    <div className={`studio ${open ? 'studio--open' : ''}`}>
      {open && (
        <div className="studio__card">
          <div className="studio__row">
            <span className="studio__label">Theme</span>
            <div className="studio__swatches">
              {THEMES.map((t) => (
                <button
                  key={t.key}
                  className={`studio__swatch ${t.key === theme ? 'is-active' : ''}`}
                  title={t.label}
                  aria-pressed={t.key === theme}
                  onClick={() => setTheme(t.key)}
                  style={{
                    background: `linear-gradient(135deg, ${t.swatch[0]}, ${t.swatch[1]} 55%, ${t.swatch[2]})`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="studio__row">
            <span className="studio__label">Layout</span>
            <div className="studio__layouts">
              {LAYOUTS.map((l) => (
                <button
                  key={l.key}
                  className={`studio__chip ${l.key === layout ? 'is-active' : ''}`}
                  aria-pressed={l.key === layout}
                  onClick={() => setLayout(l.key)}
                  title={l.description}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="studio__foot">
            <span>{overridden ? 'Previewing an override' : 'Showing saved store config'}</span>
            {overridden && (
              <button className="studio__reset" onClick={reset}>
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      <button className="studio__fab" onClick={() => setOpen((o) => !o)}>
        {open ? 'Close' : 'Studio'}
      </button>
    </div>
  )
}
