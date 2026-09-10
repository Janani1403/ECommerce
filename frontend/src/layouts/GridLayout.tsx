import { ProductCard } from '@/components/ProductCard'
import type { LayoutProps } from './registry'

export function GridLayout({ products }: LayoutProps) {
  return (
    <div className="layout-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
