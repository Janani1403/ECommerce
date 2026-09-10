export function Footer({ storeName }: { storeName: string }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner container">
        <span>
          © {new Date().getFullYear()} {storeName}
        </span>
        <span>Built on the e-commerce template</span>
      </div>
    </footer>
  )
}
