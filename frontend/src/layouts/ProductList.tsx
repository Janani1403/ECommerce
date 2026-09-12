import type { ProductListItem } from '@/api/types'
import { CONTENT } from '@/constants/content'
import { Skeleton } from '@/components/common/Skeleton'
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
            <Skeleton
              className="card__media"
              style={{ aspectRatio: 'var(--img-ratio)' }}
            />
            <div className="card__body">
              <Skeleton style={{ height: 12, width: '40%' }} />
              <Skeleton style={{ height: 16, width: '75%', marginTop: 8 }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return <p className="empty-note">{CONTENT.list.empty}</p>
  }

  return <Component products={products} />
}
