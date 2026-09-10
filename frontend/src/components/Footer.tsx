import { Link } from 'react-router-dom'

export function Footer({ storeName }: { storeName: string }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner container">
        <span>
          © {new Date().getFullYear()} {storeName}
        </span>
        <Link to="/admin">Store settings</Link>
      </div>
    </footer>
  )
}
