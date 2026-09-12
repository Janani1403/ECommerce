import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ENDPOINTS, QUERY_KEYS } from '@/constants/api'
import { apiGet, apiPatch, apiPostForm } from './client'
import type {
  Category,
  ImportRowResult,
  Paged,
  ProductDetail,
  ProductListItem,
  ProductQuery,
  StoreConfig,
  ThemeSummary,
  UpdateStoreConfig,
} from './types'

export function useStoreConfig() {
  return useQuery({
    queryKey: QUERY_KEYS.storeConfig,
    queryFn: () => apiGet<StoreConfig>(ENDPOINTS.storeConfig),
    staleTime: 5 * 60_000,
  })
}

export function useThemes() {
  return useQuery({
    queryKey: QUERY_KEYS.themes,
    queryFn: () => apiGet<ThemeSummary[]>(ENDPOINTS.themes),
    staleTime: Infinity,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: () => apiGet<Category[]>(ENDPOINTS.categories),
    staleTime: 5 * 60_000,
  })
}

export function useProducts(query: ProductQuery = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.products(query),
    queryFn: () =>
      apiGet<Paged<ProductListItem>>(ENDPOINTS.products, query as Record<string, unknown>),
    placeholderData: (prev) => prev,
  })
}

export function useProduct(id: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.product(id),
    queryFn: () => apiGet<ProductDetail>(ENDPOINTS.productById(id!)),
    enabled: id !== undefined && !Number.isNaN(id),
  })
}

export function useUpdateStoreConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateStoreConfig) =>
      apiPatch<StoreConfig>(ENDPOINTS.storeConfig, body),
    onSuccess: (data) => qc.setQueryData(QUERY_KEYS.storeConfig, data),
  })
}

export function useImportProducts() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (form: FormData) =>
      apiPostForm<ImportRowResult[]>(ENDPOINTS.adminProductsImport, form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}
