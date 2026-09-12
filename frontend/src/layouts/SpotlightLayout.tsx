import { Link } from 'react-router-dom'
import { CONTENT } from '@/constants/content'
import { ROUTES } from '@/constants/routes'
import { Price } from '@/components/product/Price'
import { ProductCard } from '@/components/product/ProductCard'
import type { LayoutProps } from './registry'

export function SpotlightLayout({ products }: LayoutProps) {
  if (products.length === 0) return null
  const [hero, ...rest] = products

  return (
    <div className="layout-spotlight">
      <Link to={ROUTES.product(hero.id)} className="spotlight-hero">
        <div className="spotlight-hero__media">
          {hero.primaryImageUrl && <img src={hero.primaryImageUrl} alt={hero.name} />}
        </div>
        <div className="spotlight-hero__text">
          <p className="eyebrow">{CONTENT.product.inFocus}</p>
          <h3>{hero.name}</h3>
          <p className="spotlight-hero__price">
            <Price amount={hero.price} currency={hero.currency} />
          </p>
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
