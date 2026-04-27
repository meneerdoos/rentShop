'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DateRangePicker } from '@/components/catalog/DateRangePicker'
import { QuantitySelector } from '@/components/catalog/QuantitySelector'
import { Button } from '@/components/ui/Button'
import { addToCart } from '@/lib/cart'
import { calculateDays, calculateTotal } from '@/lib/availability'
import type { Article } from '@/lib/supabase/types'

export function ArticleDetailClient({ article, locale }: { article: Article; locale: string }) {
  const router = useRouter()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [available, setAvailable] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleDateChange(start: string, end: string) {
    setStartDate(start)
    setEndDate(end)
    setLoading(true)
    const res = await fetch(
      `/api/availability?articleId=${article.id}&startDate=${start}&endDate=${end}`
    )
    const data = await res.json()
    setAvailable(data.available ?? 0)
    setQuantity(1)
    setLoading(false)
  }

  function handleAddToCart() {
    if (!startDate || !endDate) return
    addToCart(
      {
        articleId: article.id,
        slug: article.id,
        nameNl: article.name_nl,
        nameEn: article.name_en,
        pricePerDay: article.price_per_day,
        quantity,
        imageUrl: article.image_url,
      },
      startDate,
      endDate
    )
    const cartPath = locale === 'nl' ? `/${locale}/winkelwagen` : `/${locale}/cart`
    router.push(cartPath)
  }

  const days = startDate && endDate ? calculateDays(startDate, endDate) : 0
  const subtotal =
    days > 0
      ? calculateTotal([{ pricePerDay: article.price_per_day, quantity }], startDate, endDate)
      : 0

  return (
    <div className="flex flex-col gap-6">
      <DateRangePicker onRangeChange={handleDateChange} />
      {loading && <p className="text-sm text-gray-400">Beschikbaarheid controleren…</p>}
      {available !== null && !loading && (
        <p className="text-sm font-black">
          Beschikbaar:{' '}
          <span className={available === 0 ? 'text-red-500' : 'text-green-600'}>{available}</span>
        </p>
      )}
      {available !== null && available > 0 && (
        <>
          <QuantitySelector value={quantity} max={available} onChange={setQuantity} />
          {days > 0 && (
            <p className="font-black text-xl">
              Subtotaal: <span className="text-brand">€{subtotal.toFixed(2)}</span>
              <span className="text-sm text-gray-400 font-normal ml-2">({days} dagen)</span>
            </p>
          )}
          <Button onClick={handleAddToCart}>In winkelwagen →</Button>
        </>
      )}
    </div>
  )
}
