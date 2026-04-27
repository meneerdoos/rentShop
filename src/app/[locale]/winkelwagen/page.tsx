'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCart, removeFromCart } from '@/lib/cart'
import { calculateTotal } from '@/lib/availability'
import type { Cart } from '@/lib/cart'
import { CartItem } from '@/components/cart/CartItem'
import { Button } from '@/components/ui/Button'

export default function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [locale, setLocale] = useState('nl')

  useEffect(() => {
    params.then(p => setLocale(p.locale))
    setCart(getCart())
  }, [params])

  function handleRemove(articleId: string) {
    removeFromCart(articleId)
    setCart(getCart())
  }

  const catalogPath = locale === 'nl' ? `/${locale}/verhuur` : `/${locale}/rental`
  const checkoutPath = locale === 'nl' ? `/${locale}/afrekenen` : `/${locale}/checkout`

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-xl font-black mb-6">Uw winkelwagen is leeg.</p>
        <Link href={catalogPath} className="text-brand font-black underline">
          ← Terug naar het aanbod
        </Link>
      </div>
    )
  }

  const total = calculateTotal(
    cart.items.map(i => ({ pricePerDay: i.pricePerDay, quantity: i.quantity })),
    cart.startDate,
    cart.endDate
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-5xl font-black mb-8">Winkelwagen</h1>
      <p className="text-sm font-black uppercase tracking-widest mb-6 text-gray-500">
        Huurperiode: {cart.startDate} t/m {cart.endDate}
      </p>
      <div>
        {cart.items.map(item => (
          <CartItem
            key={item.articleId}
            item={item}
            startDate={cart.startDate}
            endDate={cart.endDate}
            locale={locale}
            onRemove={handleRemove}
          />
        ))}
      </div>
      <div className="mt-8 flex justify-between items-center">
        <p className="text-2xl font-black">
          Totaal: <span className="text-brand">€{total.toFixed(2)}</span>
        </p>
        <Button onClick={() => router.push(checkoutPath)}>Afrekenen →</Button>
      </div>
    </div>
  )
}
