import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { useStoreConfig } from './api/queries'
import { CartProvider } from './cart/CartProvider'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { StudioPanel } from './components/StudioPanel'
import { CategoryPage } from './pages/CategoryPage'
import { HomePage } from './pages/HomePage'
import { NotFound } from './pages/NotFound'
import { ProductPage } from './pages/ProductPage'
import { StudioProvider } from './theme/StudioProvider'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const { data: config } = useStoreConfig()
  const storeName = config?.storeName ?? 'Atelier'

  return (
    <StudioProvider storeConfig={config}>
      <CartProvider>
        <ScrollToTop />
        <div className="app">
          <Header storeName={storeName} />
          <main className="app__main">
            <Routes>
              <Route path="/" element={<HomePage storeName={storeName} />} />
              <Route path="/c/:slug" element={<CategoryPage />} />
              <Route path="/p/:id" element={<ProductPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer storeName={storeName} />
          <StudioPanel />
        </div>
      </CartProvider>
    </StudioProvider>
  )
}
