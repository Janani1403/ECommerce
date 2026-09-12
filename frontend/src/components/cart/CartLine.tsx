import type { CartLine as CartLineModel } from '@/providers/CartProvider'
import { CONTENT } from '@/constants/content'
import { Price } from '@/components/product/Price'

interface Props {
  line: CartLineModel
  onSetQty: (qty: number) => void
  onRemove: () => void
}

export function CartLine({ line, onSetQty, onRemove }: Props) {
  return (
    <li className="drawer-line">
      <div className="drawer-line__media">{line.imageUrl && <img src={line.imageUrl} alt="" />}</div>
      <div className="drawer-line__info">
        <p className="drawer-line__name">{line.name}</p>
        {line.size && <p className="drawer-line__size">Size {line.size}</p>}
        <div className="drawer-line__qty">
          <button onClick={() => onSetQty(line.qty - 1)} aria-label="Decrease">–</button>
          <span>{line.qty}</span>
          <button onClick={() => onSetQty(line.qty + 1)} aria-label="Increase">+</button>
          <button className="drawer-line__remove" onClick={onRemove}>
            {CONTENT.cart.remove}
          </button>
        </div>
      </div>
      <p className="drawer-line__price">
        <Price amount={line.price * line.qty} currency={line.currency} />
      </p>
    </li>
  )
}
