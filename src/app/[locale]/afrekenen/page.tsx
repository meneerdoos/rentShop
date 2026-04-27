'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { getCart, clearCart } from '@/lib/cart'
import { calculateTotal } from '@/lib/availability'
import type { Cart } from '@/lib/cart'
import { StripePaymentForm } from '@/components/checkout/StripePaymentForm'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const iStyle: React.CSSProperties = {
  background: 'var(--bg-input)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontFamily: 'var(--font-outfit)',
  fontSize: 13,
  padding: '12px 15px',
  outline: 'none',
  width: '100%',
  borderRadius: 1,
}

const lStyle: React.CSSProperties = {
  fontFamily: 'var(--font-outfit)',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: 7,
  display: 'block',
}

function StepIndicator({ step, nl }: { step: number; nl: boolean }) {
  const steps = nl
    ? ['01 Contact', '02 Betaling']
    : ['01 Contact', '02 Payment']
  return (
    <div style={{ display: 'flex', marginBottom: 40, gap: 0 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ flex: 1, paddingBottom: 10, borderBottom: `2px solid ${step >= i + 1 ? 'var(--accent)' : 'var(--border)'}`, transition: 'border-color 0.3s' }}>
          <span style={{ fontFamily: 'var(--font-outfit)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: step === i + 1 ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 0.3s' }}>{s}</span>
        </div>
      ))}
    </div>
  )
}

export default function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const router = useRouter()
  const [locale, setLocale] = useState('nl')
  const [cart, setCart] = useState<Cart | null>(null)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [outOfStock, setOutOfStock] = useState(false)
  const [loading, setLoading] = useState(false)
  const nl = locale === 'nl'

  useEffect(() => {
    params.then(p => setLocale(p.locale))
    setCart(getCart())
  }, [params])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault()
    if (!cart) return
    setLoading(true)
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        items: cart.items.map(i => ({ articleId: i.articleId, quantity: i.quantity, pricePerDay: i.pricePerDay })),
        startDate: cart.startDate,
        endDate: cart.endDate,
        locale,
      }),
    })
    const data = await res.json()
    if (res.status === 409) { setOutOfStock(true); setLoading(false); return }
    localStorage.setItem('pending_order_id', data.orderId)
    setClientSecret(data.clientSecret)
    setStep(2)
    setLoading(false)
  }

  if (!cart || cart.items.length === 0) return null

  const total = calculateTotal(
    cart.items.map(i => ({ pricePerDay: i.pricePerDay, quantity: i.quantity })),
    cart.startDate, cart.endDate
  )
  const confirmPath = nl ? `/${locale}/bevestiging` : `/${locale}/confirmation`
  const returnUrl = typeof window !== 'undefined' ? `${window.location.origin}${confirmPath}` : confirmPath

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '48px 80px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-outfit)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 28, letterSpacing: '0.05em' }}>
          ← {nl ? 'Terug' : 'Back'}
        </button>
        <h1 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 44, fontWeight: 500, color: 'var(--text)', marginBottom: 36 }}>
          {nl ? 'Afrekenen' : 'Checkout'}
        </h1>

        <StepIndicator step={step} nl={nl} />

        {outOfStock && (
          <div style={{ border: '1px solid #e53e3e', padding: '12px 16px', marginBottom: 20, fontFamily: 'var(--font-outfit)', fontSize: 13, color: '#e53e3e' }}>
            {nl ? 'Niet genoeg voorraad. Pas uw winkelwagen aan.' : 'Insufficient stock. Please adjust your cart.'}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={lStyle}>{nl ? 'Volledige naam' : 'Full name'}</label>
              <input style={iStyle} value={form.name} onChange={set('name')} required placeholder="Sophie Vandenberghe" />
            </div>
            <div>
              <label style={lStyle}>{nl ? 'E-mailadres' : 'Email address'}</label>
              <input style={iStyle} type="email" value={form.email} onChange={set('email')} required placeholder="sophie@example.com" />
            </div>
            <div>
              <label style={lStyle}>{nl ? 'Telefoon' : 'Phone'}</label>
              <input style={iStyle} value={form.phone} onChange={set('phone')} placeholder="+32 470 000 000" />
            </div>

            {/* Order summary */}
            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', padding: '16px 20px', borderRadius: 1, marginTop: 8 }}>
              <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                {nl ? 'Overzicht' : 'Summary'} · {cart.startDate} → {cart.endDate}
              </p>
              {cart.items.map(item => (
                <div key={item.articleId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, color: 'var(--text-muted)' }}>{nl ? item.nameNl : item.nameEn} ×{item.quantity}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <span style={{ fontFamily: 'var(--font-outfit)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{nl ? 'Totaal' : 'Total'}</span>
                <span style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 22, color: 'var(--text)' }}>€{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: 8, padding: 15, background: loading ? 'var(--bg-subtle)' : 'var(--accent)', color: loading ? 'var(--text-muted)' : 'var(--accent-text)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-outfit)', fontWeight: 500, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 1 }}
            >
              {loading ? (nl ? 'Bezig…' : 'Processing…') : (nl ? 'Naar betaling →' : 'Continue →')}
            </button>
          </form>
        )}

        {step === 2 && clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripePaymentForm returnUrl={returnUrl} />
          </Elements>
        )}
      </div>
    </div>
  )
}
