interface Props {
  storeName: string
  imageUrl?: string | null
}

export function Hero({ storeName, imageUrl }: Props) {
  return (
    <section className="hero">
      <div className="hero__inner container">
        <div>
          <p className="eyebrow">New season</p>
          <h1 className="hero__title">{storeName}</h1>
          <p className="hero__sub">
            A considered edit of clothing, accessories and footwear — made to be
            worn on repeat.
          </p>
          <a href="#catalog" className="btn">
            Shop the edit
          </a>
        </div>
        <div className="hero__media">{imageUrl && <img src={imageUrl} alt="" />}</div>
      </div>
    </section>
  )
}
