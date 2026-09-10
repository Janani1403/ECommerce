// Product-list layout registry. To add a layout: build a component that takes
// LayoutProps, add its styles to layouts.css, and add a row here. Keys are what
// store_config.active_layout holds.

import type { ComponentType } from 'react'
import type { ProductListItem } from '@/api/types'
import { CompactLayout } from './CompactLayout'
import { EditorialLayout } from './EditorialLayout'
import { GridLayout } from './GridLayout'
import { MasonryLayout } from './MasonryLayout'
import { SpotlightLayout } from './SpotlightLayout'
import './layouts.css'

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
    key: 'grid',
    label: 'Grid',
    description: 'Even card grid. The dependable default.',
    Component: GridLayout,
  },
  {
    key: 'masonry',
    label: 'Masonry',
    description: 'Staggered columns with varied image heights.',
    Component: MasonryLayout,
  },
  {
    key: 'editorial',
    label: 'Editorial',
    description: 'Full-width alternating feature rows.',
    Component: EditorialLayout,
  },
  {
    key: 'compact',
    label: 'Compact',
    description: 'Dense catalogue for large assortments.',
    Component: CompactLayout,
  },
  {
    key: 'spotlight',
    label: 'Spotlight',
    description: 'One hero piece over a supporting grid.',
    Component: SpotlightLayout,
  },
]

export const DEFAULT_LAYOUT = 'grid'

export function resolveLayout(key: string | undefined | null): LayoutMeta {
  return LAYOUTS.find((l) => l.key === key) ?? LAYOUTS[0]
}
