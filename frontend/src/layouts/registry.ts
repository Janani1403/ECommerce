// Product-list layout registry. To add a layout: build a component that takes
// LayoutProps, add its styles to layouts.css, add a key + a row here. Keys are
// what store_config.active_layout holds.

import type { ComponentType } from 'react'
import type { ProductListItem } from '@/api/types'
import { CompactLayout } from './CompactLayout'
import { EditorialLayout } from './EditorialLayout'
import { GridLayout } from './GridLayout'
import { MasonryLayout } from './MasonryLayout'
import { SpotlightLayout } from './SpotlightLayout'
import './layouts.css'

export const LAYOUT_KEYS = {
  grid: 'grid',
  masonry: 'masonry',
  editorial: 'editorial',
  compact: 'compact',
  spotlight: 'spotlight',
} as const

export interface LayoutProps {
  products: ProductListItem[]
}

export interface LayoutMeta {
  key: string
  label: string
  description: string
  Component: ComponentType<LayoutProps>
}

export const LAYOUTS: LayoutMeta[] = [
  {
    key: LAYOUT_KEYS.grid,
    label: 'Grid',
    description: 'Even card grid. The dependable default.',
    Component: GridLayout,
  },
  {
    key: LAYOUT_KEYS.masonry,
    label: 'Masonry',
    description: 'Staggered columns with varied image heights.',
    Component: MasonryLayout,
  },
  {
    key: LAYOUT_KEYS.editorial,
    label: 'Editorial',
    description: 'Full-width alternating feature rows.',
    Component: EditorialLayout,
  },
  {
    key: LAYOUT_KEYS.compact,
    label: 'Compact',
    description: 'Dense catalogue for large assortments.',
    Component: CompactLayout,
  },
  {
    key: LAYOUT_KEYS.spotlight,
    label: 'Spotlight',
    description: 'One hero piece over a supporting grid.',
    Component: SpotlightLayout,
  },
]

export const DEFAULT_LAYOUT = LAYOUT_KEYS.grid

export function resolveLayout(key: string | undefined | null): LayoutMeta {
  return LAYOUTS.find((l) => l.key === key) ?? LAYOUTS[0]
}
