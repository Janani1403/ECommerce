import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProduct } from '@/api/hooks'
import { useCart } from '@/providers/CartProvider'

const ADDED_FEEDBACK_MS = 1800

export function useProductPage() {
  const { id } = useParams<{ id: string }>()
  const productId = id ? Number(id) : undefined
  const query = useProduct(productId)
  const product = query.data
  const { add } = useCart()

  const [activeImage, setActiveImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [justAdded, setJustAdded] = useState(false)

  const needsSize = (product?.sizes.length ?? 0) > 0
  const canAdd = !needsSize || selectedSize !== null
  const inStockSizes = product?.sizes.filter((s) => s.stockQty > 0) ?? []

  function addToCart() {
    if (!product || !canAdd) return
    add({
      productId: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      imageUrl: product.images[0]?.url ?? null,
      size: selectedSize,
    })
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), ADDED_FEEDBACK_MS)
  }

  return {
    product,
    isLoading: query.isLoading,
    isError: query.isError,
    activeImage,
    setActiveImage,
    selectedSize,
    setSelectedSize,
    justAdded,
    needsSize,
    canAdd,
    inStockSizesCount: inStockSizes.length,
    addToCart,
  }
}
