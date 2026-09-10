import { Link } from 'react-router-dom'
import { formatPrice } from '@/lib/format'
import type { LayoutProps } from './registry'

export function EditorialLayout({ products }: LayoutProps) {
  return (
    <div className="layout-editorial">
      {products.map((p, i) => (
        <article className={`editorial-row ${i % 2 ? 'editorial-row--flip' : ''}`} key={p.id}>
          <Link to={`/p/${p.id}`} className="editorial-row__media">
            {p.primaryImageUrl && <img src={p.primaryImageUrl} alt={p.name} loading="lazy" />}
          </Link>
          <div className="editorial-row__text">
            <p className="eyebrow">
              {p.subcategoryName ?? p.categoryName}
              {p.brandName ? ` · ${p.brandName}` : ''}
            </p>
            <h3>{p.name}</h3>
            <p className="editorial-row__price">{formatPrice(p.price, p.currency)}</p>
            <Link to={`/p/${p.id}`} className="btn btn--ghost">
              View piece
            </Link>
          </div>
        </article>
      ))}
    </div>
  )
}
