import type { CSSProperties } from 'react'

/** A shimmering placeholder block. Styling comes from `.skeleton` in theme/base.css. */
export function Skeleton({ style, className = '' }: { style?: CSSProperties; className?: string }) {
  return <div className={`skeleton ${className}`} style={style} />
}
