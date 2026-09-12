import { formatPrice } from '@/lib/format'

interface Props {
  amount: number
  currency: string
  className?: string
}

export function Price({ amount, currency, className }: Props) {
  return <span className={className}>{formatPrice(amount, currency)}</span>
}
