import { CONTENT } from '@/constants/content'
import { DEFAULT_CURRENCY } from '@/constants/catalog'
import { Price } from '@/components/product/Price'
import { useCart } from '@/providers/CartProvider'
import { CartLine } from './CartLine'
import './CartDrawer.css'

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lines, subtotal, setQty, remove } = useCart()
  const currency = lines[0]?.currency ?? DEFAULT_CURRENCY

  return (
    <div
      className={`drawer ${open ? 'drawer--open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={CONTENT.cart.title}
    >
      <button className="drawer__scrim" onClick={onClose} aria-label="Close cart" />
      <aside className="drawer__panel">
        <header className="drawer__head">
          <h2>{CONTENT.cart.title}</h2>
          <button onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        {lines.length === 0 ? (
          <p className="drawer__empty">{CONTENT.cart.empty}</p>
        ) : (
          <>
            <ul className="drawer__lines">
              {lines.map((l) => (
                <CartLine
                  key={`${l.productId}-${l.size}`}
                  line={l}
                  onSetQty={(qty) => setQty(l.productId, l.size, qty)}
                  onRemove={() => remove(l.productId, l.size)}
                />
              ))}
            </ul>

            <footer className="drawer__foot">
              <div className="drawer__subtotal">
                <span>{CONTENT.cart.subtotal}</span>
                <strong>
                  <Price amount={subtotal} currency={currency} />
                </strong>
              </div>
              <button className="btn" style={{ width: '100%' }} disabled>
                {CONTENT.cart.checkout}
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
