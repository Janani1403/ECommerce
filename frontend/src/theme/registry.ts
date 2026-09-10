// Theme registry. To add a theme: drop a themes/<key>.css file that redefines
// the token contract under [data-theme="<key>"], import it here, and add a row.
// Keep keys in sync with ui_themes.key_name in the database.

import './tokens.css'
import './base.css'
import './themes/lavender-mist.css'
import './themes/peach-sorbet.css'
import './themes/sage-mint.css'
import './themes/ombre-dusk.css'
import './themes/porcelain-noir.css'

export interface ThemeMeta {
  key: string
  label: string
  /** Small palette used for the swatch in the preview panel / template picker. */
  swatch: [string, string, string]
}

export const THEMES: ThemeMeta[] = [
  { key: 'lavender-mist', label: 'Lavender Mist', swatch: ['#fdfdff', '#efecfb', '#7c6bd8'] },
  { key: 'peach-sorbet', label: 'Peach Sorbet', swatch: ['#fff9f5', '#fce9df', '#e07f5f'] },
  { key: 'sage-mint', label: 'Sage Mint', swatch: ['#f6faf7', '#e2efe9', '#4f9d7f'] },
  { key: 'ombre-dusk', label: 'Ombré Dusk', swatch: ['#cda9ec', '#f2b6c6', '#f8ccb2'] },
  { key: 'porcelain-noir', label: 'Porcelain Noir', swatch: ['#f4f3f0', '#dedcd5', '#161616'] },
]

export const DEFAULT_THEME = THEMES[0].key

export const isKnownTheme = (key: string | undefined | null): key is string =>
  !!key && THEMES.some((t) => t.key === key)
