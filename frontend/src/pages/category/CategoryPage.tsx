import { CONTENT } from '@/constants/content'
import { ProductList } from '@/layouts/ProductList'
import { useCategoryPage } from './useCategoryPage'
import './CategoryPage.css'

export function CategoryPage() {
  const { title, layout, subcategories, activeSub, setActiveSub, products, total, loading } =
    useCategoryPage()

  return (
    <section className="section container">
      <div className="section__head">
        <h2>{title}</h2>
        {total !== undefined && <span className="eyebrow">{CONTENT.home.piecesLabel(total)}</span>}
      </div>

      {subcategories.length > 0 && (
        <div className="filter-bar">
          <button className="chip" aria-pressed={activeSub === null} onClick={() => setActiveSub(null)}>
            All
          </button>
          {subcategories.map((c) => (
            <button
              key={c.id}
              className="chip"
              aria-pressed={activeSub === c.slug}
              onClick={() => setActiveSub(c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <ProductList products={products} layout={layout} loading={loading} />
    </section>
  )
}
