import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useProduct } from '@/api/queries'
import { useCart } from '@/cart/CartProvider'
import { formatPrice } from '@/lib/format'
import './product-page.css'

export function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const productId = id ? Number(id) : undefined
  const { data: p, isLoading, isError } = useProduct(productId)
  const { add } = useCart()

  const [activeImage, setActiveImage] = useState(0)
  const [size, setSize] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  if (isLoading) return <div className="section container">Loading…</div>
  if (isError || !p)
    return (
      <div className="section container">
        <p className="empty-note">That piece could not be found.</p>
        <Link to="/" className="btn btn--ghost">
          Back to the edit
        </Link>
      </div>
    )

  const inStockSizes = p.sizes.filter((s) => s.stockQty > 0)
  const needsSize = p.sizes.length > 0
  const canAdd = !needsSize || size !== null

  function addToCart() {
    if (!p || !canAdd) return
    add({
      productId: p.id,
      name: p.name,
      price: p.price,
      currency: p.currency,
      imageUrl: p.images[0]?.url ?? null,
      size,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

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
        <p className="pdp__price">{formatPrice(p.price, p.currency)}</p>

        {p.description && <p className="pdp__desc">{p.description}</p>}

        {needsSize && (
          <div className="pdp__sizes">
            <span className="eyebrow">Size</span>
            <div className="pdp__size-row">
              {p.sizes.map((s) => (
                <button
                  key={s.label}
                  className={`pdp__size ${size === s.label ? 'is-active' : ''}`}
                  disabled={s.stockQty === 0}
                  onClick={() => setSize(s.label)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {inStockSizes.length === 0 && <p className="pdp__oos">Currently sold out.</p>}
          </div>
        )}

        <button className="btn pdp__add" onClick={addToCart} disabled={!canAdd}>
          {added ? 'Added to bag' : needsSize && !size ? 'Select a size' : 'Add to bag'}
        </button>

        {p.materials.length > 0 && (
          <p className="pdp__materials">
            <span className="eyebrow">Made of</span> {p.materials.join(', ')}
          </p>
        )}
      </div>
    </div>
  )
}
