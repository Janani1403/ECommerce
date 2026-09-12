import { useProducts } from '@/api/hooks'
import { PAGE_SIZE } from '@/constants/catalog'
import { useStudio } from '@/providers/StudioProvider'

export function useHomePage() {
  const { layout } = useStudio()
  const { data, isLoading } = useProducts({ pageSize: PAGE_SIZE.home })

  return {
    layout,
    products: data?.items ?? [],
    total: data?.total,
    isLoading,
  }
}
