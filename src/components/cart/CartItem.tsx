'use client'
import { calculateDays } from '@/lib/availability'
import type { CartItem as CartItemType } from '@/lib/cart'

interface CartItemProps {
  item: CartItemType
  startDate: string
  endDate: string
  locale: string
  onRemove: (articleId: string) => void
}

export function CartItem({ item, startDate, endDate, locale, onRemove }: CartItemProps) {
  const days = calculateDays(startDate, endDate)
  const total = item.pricePerDay * item.quantity * days
  const name = locale === 'nl' ? item.nameNl : item.nameEn

  return (
    <div className="flex items-center gap-4 py-4 border-b-2 border-black">
      {item.imageUrl && (
        <img src={item.imageUrl} alt={name} className="w-16 h-16 object-cover border-2 border-black" />
      )}
      <div className="flex-1">
        <p className="font-black">{name}</p>
        <p className="text-sm text-gray-500">
          {item.quantity} × €{item.pricePerDay} × {days} dagen
        </p>
      </div>
      <p className="font-black text-brand">€{total.toFixed(2)}</p>
      <button
        onClick={() => onRemove(item.articleId)}
        className="text-sm font-black uppercase text-gray-400 hover:text-red-500 transition-colors"
      >
        ✕
      </button>
    </div>
  )
}
