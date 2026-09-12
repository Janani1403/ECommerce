import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { ProductListItem } from '@/api/types'
import { PRODUCT_STATUS } from '@/constants/catalog'
import { ROUTES } from '@/constants/routes'
import { Price } from './Price'

interface Props {
  product: ProductListItem
  /** Optional inline style, e.g. a per-card aspect-ratio for the masonry layout. */
  imageStyle?: CSSProperties
  /** Hide the meta row (brand/category) for dense layouts. */
  minimal?: boolean
}

export function ProductCard({ product, imageStyle, minimal }: Props) {
  return (
    <Link to={ROUTES.product(product.id)} className="card">
      <div className="card__media" style={imageStyle}>
        {product.primaryImageUrl ? (
          <img src={product.primaryImageUrl} alt={product.name} loading="lazy" />
        ) : (
          <div className="card__media-empty" aria-hidden="true" />
        )}
        {product.status === PRODUCT_STATUS.draft && <span className="card__flag">Preview</span>}
      </div>
      <div className="card__body">
        {!minimal && (
          <p className="card__meta">{product.brandName ?? product.categoryName}</p>
        )}
        <h3 className="card__name">{product.name}</h3>
        <p className="card__price">
          <Price amount={product.price} currency={product.currency} />
        </p>
      </div>
    </Link>
  )
}
