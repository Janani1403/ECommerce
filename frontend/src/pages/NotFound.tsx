import { Link } from 'react-router-dom'
import { CONTENT } from '@/constants/content'
import { ROUTES } from '@/constants/routes'

export function NotFound() {
  return (
    <div className="section container" style={{ textAlign: 'center' }}>
      <h1>{CONTENT.notFound.title}</h1>
      <p className="empty-note">{CONTENT.notFound.body}</p>
      <Link to={ROUTES.home} className="btn btn--ghost">
        {CONTENT.product.back}
      </Link>
    </div>
  )
}
