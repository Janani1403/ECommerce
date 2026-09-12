import { Link } from 'react-router-dom'
import { CONTENT } from '@/constants/content'
import { ROUTES } from '@/constants/routes'
import './Footer.css'

export function Footer({ storeName }: { storeName: string }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner container">
        <span>
          © {new Date().getFullYear()} {storeName}
        </span>
        <Link to={ROUTES.admin}>{CONTENT.footer.settings}</Link>
      </div>
    </footer>
  )
}
