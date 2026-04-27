'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { getCart, clearCart } from '@/lib/cart'
import { calculateTotal } from '@/lib/availability'
import type { Cart } from '@/lib/cart'
import { CustomerForm } from '@/components/checkout/CustomerForm'
import { StripePaymentForm } from '@/components/checkout/StripePaymentForm'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const router = useRouter()
  const [locale, setLocale] = useState('nl')
  const [cart, setCart] = useState<Cart | null>(null)
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' })
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [outOfStock, setOutOfStock] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    params.then(p => setLocale(p.locale))
    setCart(getCart())
  }, [params])

  function handleCustomerChange(field: string, value: string) {
    setCustomer(prev => ({ ...prev, [field]: value }))
  }

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault()
    if (!cart) return
    setLoading(true)
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        items: cart.items.map(i => ({
          articleId: i.articleId,
          quantity: i.quantity,
          pricePerDay: i.pricePerDay,
        })),
        startDate: cart.startDate,
        endDate: cart.endDate,
        locale,
      }),
    })
    const data = await res.json()
    if (res.status === 409) {
      setOutOfStock(true)
      setLoading(false)
      return
    }
    localStorage.setItem('pending_order_id', data.orderId)
    setClientSecret(data.clientSecret)
    setLoading(false)
  }

  if (!cart || cart.items.length === 0) {
    return null
  }

  const total = calculateTotal(
    cart.items.map(i => ({ pricePerDay: i.pricePerDay, quantity: i.quantity })),
    cart.startDate,
    cart.endDate
  )

  const confirmPath = locale === 'nl' ? `/${locale}/bevestiging` : `/${locale}/confirmation`
  const returnUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${confirmPath}`
    : confirmPath

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        <h1 className="text-4xl font-black mb-8">Afrekenen</h1>
        {outOfStock && (
          <p className="text-red-500 font-black mb-4 border-2 border-red-500 p-3">
            Niet genoeg voorraad voor de gekozen periode. Pas uw winkelwagen aan.
          </p>
        )}
        {!clientSecret ? (
          <form onSubmit={handleCreateOrder} className="flex flex-col gap-6">
            <CustomerForm values={customer} onChange={handleCustomerChange} />
            <button
              type="submit"
              disabled={loading}
              className="bg-brand text-white font-black uppercase tracking-widest px-6 py-3 hover:bg-brand-hover transition-colors disabled:opacity-50"
            >
              {loading ? 'Bezig…' : 'Naar betaling →'}
            </button>
          </form>
        ) : (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripePaymentForm returnUrl={returnUrl} />
          </Elements>
        )}
      </div>
      <div className="bg-gray-50 border-2 border-black p-6">
        <h2 className="font-black text-xl mb-4 uppercase tracking-wide">Overzicht</h2>
        <p className="text-sm text-gray-500 mb-4">
          {cart.startDate} t/m {cart.endDate}
        </p>
        {cart.items.map(item => (
          <div key={item.articleId} className="flex justify-between text-sm py-2 border-b border-gray-200">
            <span>{locale === 'nl' ? item.nameNl : item.nameEn} × {item.quantity}</span>
          </div>
        ))}
        <div className="mt-4 flex justify-between font-black text-lg">
          <span>Totaal</span>
          <span className="text-brand">€{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
