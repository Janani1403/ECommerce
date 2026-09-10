import type { ProductListItem } from '@/api/types'
import { resolveLayout } from './registry'

interface Props {
  products: ProductListItem[]
  layout: string
  loading?: boolean
  skeletonCount?: number
}

export function ProductList({ products, layout, loading, skeletonCount = 8 }: Props) {
  const { Component } = resolveLayout(layout)

  if (loading) {
    return (
      <div className="layout-grid">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="card">
            <div className="card__media skeleton" style={{ aspectRatio: 'var(--img-ratio)' }} />
            <div className="card__body">
              <div className="skeleton" style={{ height: 12, width: '40%' }} />
              <div className="skeleton" style={{ height: 16, width: '75%', marginTop: 8 }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return <p className="empty-note">Nothing here yet.</p>
  }

  return <Component products={products} />
}
