// Mirrors the DTOs returned by Ecom.Api.

export interface Theme {
  key: string
  name: string
  defaultLayout: string
  cssVariables: Record<string, string>
}

export interface StoreConfig {
  storeName: string
  currency: string
  activeLayout: string
  aiStylistEnabled: boolean
  theme: Theme | null
}

export interface ThemeSummary {
  key: string
  name: string
  defaultLayout: string
}

export interface Category {
  id: number
  name: string
  slug: string
  productType: string
  parentId: number | null
  sortOrder: number
}

export interface ProductListItem {
  id: number
  sku: string
  name: string
  price: number
  currency: string
  gender: string
  status: string
  brandName: string | null
  categoryName: string
  subcategoryName: string | null
  primaryImageUrl: string | null
}

export interface ProductImage {
  url: string
  altText: string | null
  isPrimary: boolean
  sortOrder: number
}

export interface ProductSize {
  label: string
  sizeGroup: string
  stockQty: number
}

export interface ProductDetail {
  id: number
  sku: string
  name: string
  price: number
  currency: string
  description: string | null
  gender: string
  status: string
  brandName: string | null
  categoryName: string
  subcategoryName: string | null
  images: ProductImage[]
  sizes: ProductSize[]
  materials: string[]
}

export interface Paged<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ProductQuery {
  category?: string
  subcategory?: string
  gender?: string
  q?: string
  status?: string
  page?: number
  pageSize?: number
}
