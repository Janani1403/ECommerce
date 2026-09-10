import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="section container" style={{ textAlign: 'center' }}>
      <h1>Page not found</h1>
      <p className="empty-note">The page you were after isn’t here.</p>
      <Link to="/" className="btn btn--ghost">
        Back to the edit
      </Link>
    </div>
  )
}
