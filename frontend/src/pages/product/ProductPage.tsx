import { Link } from 'react-router-dom'
import { CONTENT } from '@/constants/content'
import { ROUTES } from '@/constants/routes'
import { Price } from '@/components/product/Price'
import { useProductPage } from './useProductPage'
import './ProductPage.css'

export function ProductPage() {
  const {
    product: p,
    isLoading,
    isError,
    activeImage,
    setActiveImage,
    selectedSize,
    setSelectedSize,
    justAdded,
    needsSize,
    canAdd,
    inStockSizesCount,
    addToCart,
  } = useProductPage()

  if (isLoading) return <div className="section container">Loading…</div>

  if (isError || !p) {
    return (
      <div className="section container">
        <p className="empty-note">{CONTENT.product.notFound}</p>
        <Link to={ROUTES.home} className="btn btn--ghost">
          {CONTENT.product.back}
        </Link>
      </div>
    )
  }

  const addLabel = justAdded
    ? CONTENT.product.added
    : needsSize && !selectedSize
      ? CONTENT.product.selectSize
      : CONTENT.product.addToBag

  return (
    <div className="pdp section container">
      <div className="pdp__gallery">
        <div className="pdp__stage">
          {p.images[activeImage] && <img src={p.images[activeImage].url} alt={p.name} />}
        </div>
        {p.images.length > 1 && (
          <div className="pdp__thumbs">
            {p.images.map((img, i) => (
              <button
                key={img.url}
                className={`pdp__thumb ${i === activeImage ? 'is-active' : ''}`}
                onClick={() => setActiveImage(i)}
              >
                <img src={img.url} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pdp__info">
        <p className="eyebrow">
          {p.subcategoryName ?? p.categoryName}
          {p.brandName ? ` · ${p.brandName}` : ''}
        </p>
        <h1>{p.name}</h1>
        <p className="pdp__price">
          <Price amount={p.price} currency={p.currency} />
        </p>

        {p.description && <p className="pdp__desc">{p.description}</p>}

        {needsSize && (
          <div className="pdp__sizes">
            <span className="eyebrow">{CONTENT.product.sizeLabel}</span>
            <div className="pdp__size-row">
              {p.sizes.map((s) => (
                <button
                  key={s.label}
                  className={`pdp__size ${selectedSize === s.label ? 'is-active' : ''}`}
                  disabled={s.stockQty === 0}
                  onClick={() => setSelectedSize(s.label)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {inStockSizesCount === 0 && <p className="pdp__oos">{CONTENT.product.soldOut}</p>}
          </div>
        )}

        <button className="btn pdp__add" onClick={addToCart} disabled={!canAdd}>
          {addLabel}
        </button>

        {p.materials.length > 0 && (
          <p className="pdp__materials">
            <span className="eyebrow">{CONTENT.product.madeOf}</span> {p.materials.join(', ')}
          </p>
        )}
      </div>
    </div>
  )
}
