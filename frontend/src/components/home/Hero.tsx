import { CONTENT } from '@/constants/content'
import './Hero.css'

interface Props {
  storeName: string
  imageUrl?: string | null
  /** Anchor the CTA scrolls to. */
  ctaHref: string
}

export function Hero({ storeName, imageUrl, ctaHref }: Props) {
  return (
    <section className="hero">
      <div className="hero__inner container">
        <div>
          <p className="eyebrow">{CONTENT.hero.eyebrow}</p>
          <h1 className="hero__title">{storeName}</h1>
          <p className="hero__sub">{CONTENT.hero.subtitle}</p>
          <a href={ctaHref} className="btn">
            {CONTENT.hero.cta}
          </a>
        </div>
        <div className="hero__media">{imageUrl && <img src={imageUrl} alt="" />}</div>
      </div>
    </section>
  )
}
