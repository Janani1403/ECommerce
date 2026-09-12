import { Link } from 'react-router-dom'
import { CONTENT } from '@/constants/content'
import { ROUTES } from '@/constants/routes'
import { FileDropZone } from '@/components/common/FileDropZone'
import { DEFAULT_THEME } from '@/theme/registry'
import { useImportProductsPage } from './useImportProductsPage'
import './ImportProductsPage.css'

const TEMPLATE_URL = '/products-template.csv'

export function ImportProductsPage() {
  const {
    csvFile, zipFile, setCsvFile, setZipFile,
    submit, canSubmit, isSubmitting, results, summary, error,
  } = useImportProductsPage()

  return (
    <div className="import section container" data-theme={DEFAULT_THEME}>
      <header className="admin__head">
        <div>
          <p className="eyebrow">{CONTENT.import.eyebrow}</p>
          <h1>{CONTENT.import.title}</h1>
        </div>
        <Link to={ROUTES.admin} className="btn btn--ghost">
          {CONTENT.import.back}
        </Link>
      </header>
      <p className="admin__note">
        {CONTENT.import.intro}{' '}
        <a href={TEMPLATE_URL} download>
          {CONTENT.import.templateLink}
        </a>
      </p>

      <div className="import__fields">
        <FileDropZone
          label={CONTENT.import.csvLabel}
          accept=".csv,text/csv"
          file={csvFile}
          onFile={setCsvFile}
        />
        <FileDropZone
          label={CONTENT.import.zipLabel}
          accept=".zip,application/zip"
          file={zipFile}
          onFile={setZipFile}
        />
      </div>

      <div className="import__actions">
        <button className="btn" disabled={!canSubmit} onClick={submit}>
          {isSubmitting ? CONTENT.import.submitting : CONTENT.import.submit}
        </button>
        {error && <span className="admin__error">{error.message}</span>}
      </div>

      {results && (
        <section className="import__results">
          <h2>{CONTENT.import.resultsTitle}</h2>
          {summary && (
            <p className="import__summary">
              {summary.inserted} inserted · {summary.updated} updated · {summary.errors} errors
            </p>
          )}
          <div className="import__table">
            <table>
              <thead>
                <tr>
                  <th>{CONTENT.import.columns.sku}</th>
                  <th>{CONTENT.import.columns.action}</th>
                  <th>{CONTENT.import.columns.message}</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={`${r.sku}-${i}`} className={r.action === 'error' ? 'is-error' : ''}>
                    <td>{r.sku}</td>
                    <td>{r.action}</td>
                    <td>{r.message ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
