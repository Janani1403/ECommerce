import { useQuery } from '@tanstack/react-query'
import { apiGet } from './client'
import type {
  Category,
  Paged,
  ProductDetail,
  ProductListItem,
  ProductQuery,
  StoreConfig,
  ThemeSummary,
} from './types'

export function useStoreConfig() {
  return useQuery({
    queryKey: ['store-config'],
    queryFn: () => apiGet<StoreConfig>('/store-config'),
    staleTime: 5 * 60_000,
  })
}

export function useThemes() {
  return useQuery({
    queryKey: ['themes'],
    queryFn: () => apiGet<ThemeSummary[]>('/themes'),
    staleTime: Infinity,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<Category[]>('/categories'),
    staleTime: 5 * 60_000,
  })
}

export function useProducts(query: ProductQuery = {}) {
  return useQuery({
    queryKey: ['products', query],
    queryFn: () => apiGet<Paged<ProductListItem>>('/products', query as Record<string, unknown>),
    placeholderData: (prev) => prev,
  })
}

export function useProduct(id: number | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => apiGet<ProductDetail>(`/products/${id}`),
    enabled: id !== undefined && !Number.isNaN(id),
  })
}
