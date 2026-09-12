import { ProductCard } from '@/components/product/ProductCard'
import { hashUnit } from '@/lib/format'
import type { LayoutProps } from './registry'

const RATIOS = ['3 / 4', '4 / 5', '1 / 1', '5 / 7', '2 / 3']

export function MasonryLayout({ products }: LayoutProps) {
  return (
    <div className="layout-masonry">
      {products.map((p) => {
        const ratio = RATIOS[Math.floor(hashUnit(p.sku) * RATIOS.length)]
        return (
          <div className="layout-masonry__item" key={p.id}>
            <ProductCard product={p} imageStyle={{ aspectRatio: ratio }} />
          </div>
        )
      })}
    </div>
  )
}
