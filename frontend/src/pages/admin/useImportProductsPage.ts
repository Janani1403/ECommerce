import { useState } from 'react'
import { useImportProducts } from '@/api/hooks'

export function useImportProductsPage() {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [zipFile, setZipFile] = useState<File | null>(null)
  const mutation = useImportProducts()

  function submit() {
    if (!csvFile) return
    const form = new FormData()
    form.append('csv', csvFile)
    if (zipFile) form.append('images', zipFile)
    mutation.mutate(form)
  }

  const results = mutation.data ?? null
  const summary = results
    ? {
        inserted: results.filter((r) => r.action === 'inserted').length,
        updated: results.filter((r) => r.action === 'updated').length,
        errors: results.filter((r) => r.action === 'error').length,
      }
    : null

  return {
    csvFile,
    zipFile,
    setCsvFile,
    setZipFile,
    submit,
    canSubmit: !!csvFile && !mutation.isPending,
    isSubmitting: mutation.isPending,
    results,
    summary,
    error: mutation.isError ? (mutation.error as Error) : null,
  }
}
