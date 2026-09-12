import { ProductCard } from '@/components/product/ProductCard'
import type { LayoutProps } from './registry'

export function CompactLayout({ products }: LayoutProps) {
  return (
    <div className="layout-compact">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} minimal />
      ))}
    </div>
  )
}
