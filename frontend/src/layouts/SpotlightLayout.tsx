import { Link } from 'react-router-dom'
import { ProductCard } from '@/components/ProductCard'
import { formatPrice } from '@/lib/format'
import type { LayoutProps } from './registry'

export function SpotlightLayout({ products }: LayoutProps) {
  if (products.length === 0) return null
  const [hero, ...rest] = products

  return (
    <div className="layout-spotlight">
      <Link to={`/p/${hero.id}`} className="spotlight-hero">
        <div className="spotlight-hero__media">
          {hero.primaryImageUrl && <img src={hero.primaryImageUrl} alt={hero.name} />}
        </div>
        <div className="spotlight-hero__text">
          <p className="eyebrow">In focus</p>
          <h3>{hero.name}</h3>
          <p className="spotlight-hero__price">{formatPrice(hero.price, hero.currency)}</p>
        </div>
      </Link>

      <div className="spotlight-rest">
        {rest.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
