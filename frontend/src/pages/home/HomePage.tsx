import { CONTENT } from '@/constants/content'
import { Hero } from '@/components/home/Hero'
import { ProductList } from '@/layouts/ProductList'
import { useHomePage } from './useHomePage'

const CATALOG_ANCHOR = 'catalog'

export function HomePage({ storeName }: { storeName: string }) {
  const { layout, products, total, isLoading } = useHomePage()

  return (
    <>
      <Hero
        storeName={storeName}
        imageUrl={products[0]?.primaryImageUrl}
        ctaHref={`#${CATALOG_ANCHOR}`}
      />

      <section className="section container" id={CATALOG_ANCHOR}>
        <div className="section__head">
          <h2>{CONTENT.home.sectionTitle}</h2>
          {total !== undefined && (
            <span className="eyebrow">{CONTENT.home.piecesLabel(total)}</span>
          )}
        </div>
        <ProductList products={products} layout={layout} loading={isLoading} />
      </section>
    </>
  )
}
