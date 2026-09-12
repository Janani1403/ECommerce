import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { STORAGE_KEYS } from '@/constants/storage'

export interface CartLine {
  productId: number
  name: string
  price: number
  currency: string
  imageUrl: string | null
  size: string | null
  qty: number
}

interface CartState {
  lines: CartLine[]
  count: number
  subtotal: number
  add: (line: Omit<CartLine, 'qty'>, qty?: number) => void
  setQty: (productId: number, size: string | null, qty: number) => void
  remove: (productId: number, size: string | null) => void
  clear: () => void
}

const CartContext = createContext<CartState | null>(null)

const sameLine = (a: CartLine, productId: number, size: string | null) =>
  a.productId === productId && a.size === size

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(lines))
  }, [lines])

  const add = useCallback<CartState['add']>((line, qty = 1) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => sameLine(l, line.productId, line.size))
      if (i === -1) return [...prev, { ...line, qty }]
      const next = [...prev]
      next[i] = { ...next[i], qty: next[i].qty + qty }
      return next
    })
  }, [])

  const setQty = useCallback<CartState['setQty']>((productId, size, qty) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !sameLine(l, productId, size))
        : prev.map((l) => (sameLine(l, productId, size) ? { ...l, qty } : l)),
    )
  }, [])

  const remove = useCallback<CartState['remove']>((productId, size) => {
    setLines((prev) => prev.filter((l) => !sameLine(l, productId, size)))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const value = useMemo<CartState>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0)
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
    return { lines, count, subtotal, add, setQty, remove, clear }
  }, [lines, add, setQty, remove, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartState {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within <CartProvider>')
  return ctx
}
