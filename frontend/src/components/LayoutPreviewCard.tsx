interface Props {
  layoutKey: string
  label: string
  description: string
  selected: boolean
  onSelect: () => void
}

function Schematic({ layoutKey }: { layoutKey: string }) {
  switch (layoutKey) {
    case 'masonry':
      return (
        <div className="lm lm--masonry">
          {['a', 'b', 'c', 'd', 'e', 'f'].map((k, i) => (
            <span key={k} data-h={i % 3} />
          ))}
        </div>
      )
    case 'editorial':
      return (
        <div className="lm lm--editorial">
          {['a', 'b', 'c'].map((k, i) => (
            <span key={k} className={i % 2 ? 'flip' : ''}>
              <i />
              <i />
            </span>
          ))}
        </div>
      )
    case 'compact':
      return (
        <div className="lm lm--compact">
          {Array.from({ length: 15 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>
      )
    case 'spotlight':
      return (
        <div className="lm lm--spotlight">
          <span className="hero" />
          <span />
          <span />
          <span />
          <span />
        </div>
      )
    default:
      return (
        <div className="lm lm--grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>
      )
  }
}

export function LayoutPreviewCard({ layoutKey, label, description, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      className={`pick-card ${selected ? 'is-selected' : ''}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <div className="layout-mock">
        <Schematic layoutKey={layoutKey} />
      </div>
      <span className="pick-card__label">
        {label}
        {selected && <span className="pick-card__check">✓</span>}
      </span>
      <span className="pick-card__desc">{description}</span>
    </button>
  )
}
