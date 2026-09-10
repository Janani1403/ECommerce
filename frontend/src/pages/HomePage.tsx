import { useProducts } from '@/api/queries'
import { Hero } from '@/components/Hero'
import { ProductList } from '@/layouts/ProductList'
import { useStudio } from '@/theme/StudioProvider'

export function HomePage({ storeName }: { storeName: string }) {
  const { layout } = useStudio()
  const { data, isLoading } = useProducts({ pageSize: 24 })
  const products = data?.items ?? []

  return (
    <>
      <Hero storeName={storeName} imageUrl={products[0]?.primaryImageUrl} />

      <section className="section container" id="catalog">
        <div className="section__head">
          <h2>The edit</h2>
          {data && <span className="eyebrow">{data.total} pieces</span>}
        </div>
        <ProductList products={products} layout={layout} loading={isLoading} />
      </section>
    </>
  )
}
