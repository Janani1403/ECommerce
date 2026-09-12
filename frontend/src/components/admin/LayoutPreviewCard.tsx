import { LayoutSchematic } from './LayoutSchematic'
import './PreviewCard.css'
import './LayoutPreviewCard.css'

interface Props {
  layoutKey: string
  label: string
  description: string
  selected: boolean
  onSelect: () => void
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
        <LayoutSchematic layoutKey={layoutKey} />
      </div>
      <span className="pick-card__label">
        {label}
        {selected && <span className="pick-card__check">✓</span>}
      </span>
      <span className="pick-card__desc">{description}</span>
    </button>
  )
}
