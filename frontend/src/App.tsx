import { Route, Routes } from 'react-router-dom'
import { useStoreConfig } from '@/api/hooks'
import { CONTENT } from '@/constants/content'
import { ROUTE_PATTERNS } from '@/constants/routes'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { StudioPanel } from '@/components/studio/StudioPanel'
import { AdminPage } from '@/pages/admin/AdminPage'
import { ImportProductsPage } from '@/pages/admin/ImportProductsPage'
import { CategoryPage } from '@/pages/category/CategoryPage'
import { HomePage } from '@/pages/home/HomePage'
import { NotFound } from '@/pages/NotFound'
import { ProductPage } from '@/pages/product/ProductPage'
import './styles/shell.css'

export default function App() {
  const { data: config } = useStoreConfig()
  const storeName = config?.storeName ?? CONTENT.fallbackStoreName

  return (
    <div className="app">
      <ScrollToTop />
      <Header storeName={storeName} />
      <main className="app__main">
        <Routes>
          <Route path={ROUTE_PATTERNS.home} element={<HomePage storeName={storeName} />} />
          <Route path={ROUTE_PATTERNS.category} element={<CategoryPage />} />
          <Route path={ROUTE_PATTERNS.product} element={<ProductPage />} />
          <Route path={ROUTE_PATTERNS.admin} element={<AdminPage />} />
          <Route path={ROUTE_PATTERNS.adminImport} element={<ImportProductsPage />} />
          <Route path={ROUTE_PATTERNS.notFound} element={<NotFound />} />
        </Routes>
      </main>
      <Footer storeName={storeName} />
      <StudioPanel />
    </div>
  )
}
