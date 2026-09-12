import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCategories, useProducts } from '@/api/hooks'
import { PAGE_SIZE } from '@/constants/catalog'
import { useStudio } from '@/providers/StudioProvider'

export function useCategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const { layout } = useStudio()
  const { data: categories } = useCategories()
  const [activeSub, setActiveSub] = useState<string | null>(null)

  const category = categories?.find((c) => c.slug === slug)
  const subcategories = (categories ?? []).filter((c) => c.parentId === category?.id)

  const { data, isLoading, isFetching } = useProducts({
    category: slug,
    subcategory: activeSub ?? undefined,
    pageSize: PAGE_SIZE.category,
  })

  return {
    title: category?.name ?? slug ?? '',
    layout,
    subcategories,
    activeSub,
    setActiveSub,
    products: data?.items ?? [],
    total: data?.total,
    loading: isLoading || (isFetching && !data),
  }
}
