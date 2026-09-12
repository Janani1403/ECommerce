/** Path builders for <Link to> / navigate(). */
export const ROUTES = {
  home: '/',
  category: (slug: string) => `/c/${slug}`,
  product: (id: number | string) => `/p/${id}`,
  admin: '/admin',
  adminImport: '/admin/import',
} as const

/** Patterns for <Route path>. */
export const ROUTE_PATTERNS = {
  home: '/',
  category: '/c/:slug',
  product: '/p/:id',
  admin: '/admin',
  adminImport: '/admin/import',
  notFound: '*',
} as const
