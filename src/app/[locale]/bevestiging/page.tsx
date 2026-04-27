'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { clearCart } from '@/lib/cart'

export default function ConfirmationPage({ params }: { params: Promise<{ locale: string }> }) {
  const [orderId, setOrderId] = useState<string | null>(null)
  const [locale, setLocale] = useState('nl')

  useEffect(() => {
    params.then(p => setLocale(p.locale))
    const id = localStorage.getItem('pending_order_id')
    if (id) {
      setOrderId(id)
      localStorage.removeItem('pending_order_id')
      clearCart()
    }
  }, [params])

  const ref = orderId ? orderId.slice(0, 8).toUpperCase() : '—'
  const catalogPath = locale === 'nl' ? `/${locale}/verhuur` : `/${locale}/rental`

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-6">✓</div>
      <h1 className="text-5xl font-black mb-4">Boeking bevestigd!</h1>
      <p className="text-gray-500 mb-2">
        Referentie: <strong>{ref}</strong>
      </p>
      <p className="text-gray-500 mb-8">U ontvangt een bevestiging per e-mail.</p>
      <Link
        href={catalogPath}
        className="inline-block bg-black text-white font-black uppercase tracking-widest px-8 py-4 hover:bg-brand transition-colors"
      >
        ← Terug naar het aanbod
      </Link>
    </div>
  )
}
