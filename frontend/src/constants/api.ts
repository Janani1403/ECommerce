// API surface. In dev VITE_API_BASE_URL is blank and Vite proxies /api -> :5056.
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export const ENDPOINTS = {
  storeConfig: '/store-config',
  themes: '/themes',
  categories: '/categories',
  products: '/products',
  productById: (id: number | string) => `/products/${id}`,
  adminProductsImport: '/admin/products/import',
} as const

export const QUERY_KEYS = {
  storeConfig: ['store-config'] as const,
  themes: ['themes'] as const,
  categories: ['categories'] as const,
  products: (query: unknown) => ['products', query] as const,
  product: (id: number | undefined) => ['product', id] as const,
}

/** Header carrying the admin token when the deployment requires one. */
export const ADMIN_TOKEN_HEADER = 'X-Admin-Token'
