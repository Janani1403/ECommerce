import { useCart } from '@/cart/CartProvider'
import { formatPrice } from '@/lib/format'
import './cart-drawer.css'

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lines, subtotal, setQty, remove } = useCart()
  const currency = lines[0]?.currency ?? 'INR'

  return (
    <div className={`drawer ${open ? 'drawer--open' : ''}`} role="dialog" aria-modal="true" aria-label="Cart">
      <button className="drawer__scrim" onClick={onClose} aria-label="Close cart" />
      <aside className="drawer__panel">
        <header className="drawer__head">
          <h2>Your bag</h2>
          <button onClick={onClose} aria-label="Close">✕</button>
        </header>

        {lines.length === 0 ? (
          <p className="drawer__empty">Your bag is empty.</p>
        ) : (
          <>
            <ul className="drawer__lines">
              {lines.map((l) => (
                <li key={`${l.productId}-${l.size}`} className="drawer-line">
                  <div className="drawer-line__media">
                    {l.imageUrl && <img src={l.imageUrl} alt="" />}
                  </div>
                  <div className="drawer-line__info">
                    <p className="drawer-line__name">{l.name}</p>
                    {l.size && <p className="drawer-line__size">Size {l.size}</p>}
                    <div className="drawer-line__qty">
                      <button onClick={() => setQty(l.productId, l.size, l.qty - 1)} aria-label="Decrease">–</button>
                      <span>{l.qty}</span>
                      <button onClick={() => setQty(l.productId, l.size, l.qty + 1)} aria-label="Increase">+</button>
                      <button className="drawer-line__remove" onClick={() => remove(l.productId, l.size)}>
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="drawer-line__price">{formatPrice(l.price * l.qty, l.currency)}</p>
                </li>
              ))}
            </ul>

            <footer className="drawer__foot">
              <div className="drawer__subtotal">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal, currency)}</strong>
              </div>
              <button className="btn" style={{ width: '100%' }} disabled>
                Checkout — coming soon
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
