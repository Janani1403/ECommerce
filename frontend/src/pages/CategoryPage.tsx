import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCategories, useProducts } from '@/api/queries'
import { ProductList } from '@/layouts/ProductList'
import { useStudio } from '@/theme/StudioProvider'

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const { layout } = useStudio()
  const { data: categories } = useCategories()
  const [sub, setSub] = useState<string | null>(null)

  const category = categories?.find((c) => c.slug === slug)
  const children = (categories ?? []).filter((c) => c.parentId === category?.id)

  const { data, isLoading, isFetching } = useProducts({
    category: slug,
    subcategory: sub ?? undefined,
    pageSize: 48,
  })

  return (
    <section className="section container">
      <div className="section__head">
        <h2>{category?.name ?? slug}</h2>
        {data && <span className="eyebrow">{data.total} pieces</span>}
      </div>

      {children.length > 0 && (
        <div className="filter-bar">
          <button className="chip" aria-pressed={sub === null} onClick={() => setSub(null)}>
            All
          </button>
          {children.map((c) => (
            <button
              key={c.id}
              className="chip"
              aria-pressed={sub === c.slug}
              onClick={() => setSub(c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <ProductList
        products={data?.items ?? []}
        layout={layout}
        loading={isLoading || (isFetching && !data)}
      />
    </section>
  )
}
