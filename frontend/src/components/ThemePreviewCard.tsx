interface Props {
  themeKey: string
  label: string
  selected: boolean
  onSelect: () => void
}

/**
 * A small, self-contained mock of the storefront rendered in the given theme.
 * The `data-theme` attribute scopes that theme's token overrides to this subtree
 * (CSS custom properties inherit), so the preview uses the real theme values.
 */
export function ThemePreviewCard({ themeKey, label, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      className={`pick-card ${selected ? 'is-selected' : ''}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <div className="theme-mock" data-theme={themeKey}>
        <div className="theme-mock__bar">
          <span className="theme-mock__brand" />
          <span className="theme-mock__link" />
          <span className="theme-mock__link" />
        </div>
        <div className="theme-mock__hero">
          <span className="theme-mock__h1" />
          <span className="theme-mock__btn" />
        </div>
        <div className="theme-mock__grid">
          <span className="theme-mock__tile" />
          <span className="theme-mock__tile" />
          <span className="theme-mock__tile" />
        </div>
      </div>
      <span className="pick-card__label">
        {label}
        {selected && <span className="pick-card__check">✓</span>}
      </span>
    </button>
  )
}
