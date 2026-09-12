import { LAYOUT_KEYS } from '@/layouts/registry'

/** A tiny structural diagram of a product-list layout (theme-neutral). */
export function LayoutSchematic({ layoutKey }: { layoutKey: string }) {
  switch (layoutKey) {
    case LAYOUT_KEYS.masonry:
      return (
        <div className="lm lm--masonry">
          {['a', 'b', 'c', 'd', 'e', 'f'].map((k, i) => (
            <span key={k} data-h={i % 3} />
          ))}
        </div>
      )
    case LAYOUT_KEYS.editorial:
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
    case LAYOUT_KEYS.compact:
      return (
        <div className="lm lm--compact">
          {Array.from({ length: 15 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>
      )
    case LAYOUT_KEYS.spotlight:
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
