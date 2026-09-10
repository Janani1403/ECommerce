import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCategories } from '@/api/queries'
import { useCart } from '@/cart/CartProvider'
import { CartDrawer } from './CartDrawer'

export function Header({ storeName }: { storeName: string }) {
  const { data: categories } = useCategories()
  const { count } = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  const topLevel = (categories ?? []).filter((c) => c.parentId === null)

  return (
    <header className="site-header">
      <div className="site-header__inner container">
        <Link to="/" className="site-header__brand">
          {storeName}
        </Link>

        <nav className="site-nav">
          {topLevel.map((c) => (
            <NavLink key={c.id} to={`/c/${c.slug}`}>
              {c.name}
            </NavLink>
          ))}
        </nav>

        <button className="cart-button" onClick={() => setCartOpen(true)}>
          Bag
          {count > 0 && <span className="cart-button__count">{count}</span>}
        </button>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  )
}
