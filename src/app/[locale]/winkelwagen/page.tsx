'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCart, removeFromCart } from '@/lib/cart'
import { calculateTotal } from '@/lib/availability'
import type { Cart } from '@/lib/cart'

export default function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [locale, setLocale] = useState('nl')

  useEffect(() => {
    params.then(p => setLocale(p.locale))
    setCart(getCart())
  }, [params])

  function handleRemove(articleId: string) {
    removeFromCart(articleId)
    setCart(getCart())
    window.dispatchEvent(new Event('cart-updated'))
  }

  const nl = locale === 'nl'
  const catalogPath = nl ? `/${locale}/verhuur` : `/${locale}/rental`
  const checkoutPath = nl ? `/${locale}/afrekenen` : `/${locale}/checkout`

  if (!cart || cart.items.length === 0) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <p style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 38, color: 'var(--text)', fontWeight: 400 }}>
          {nl ? 'Uw winkelwagen is leeg' : 'Your cart is empty'}
        </p>
        <Link href={catalogPath} style={{ display: 'inline-block', background: 'var(--accent)', color: 'var(--accent-text)', fontFamily: 'var(--font-outfit)', fontWeight: 500, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '14px 36px', textDecoration: 'none', borderRadius: 1 }}>
          {nl ? 'Bekijk aanbod' : 'Browse Catalog'}
        </Link>
      </div>
    )
  }

  const total = calculateTotal(
    cart.items.map(i => ({ pricePerDay: i.pricePerDay, quantity: i.quantity })),
    cart.startDate, cart.endDate
  )

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '48px 80px' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 48, fontWeight: 500, color: 'var(--text)', marginBottom: 44 }}>
          {nl ? 'Uw winkelwagen' : 'Your Cart'}
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 44, alignItems: 'start' }}>
          {/* Line items */}
          <div>
            {cart.items.map(item => {
              const name = nl ? item.nameNl : item.nameEn
              const lineTotal = item.pricePerDay * item.quantity * Math.max(1, calculateTotal([{ pricePerDay: 1, quantity: item.quantity }], cart.startDate, cart.endDate) / item.quantity)
              return (
                <div key={item.articleId} style={{ display: 'grid', gridTemplateColumns: '90px 1fr auto', gap: 18, alignItems: 'center', padding: '22px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ height: 72, borderRadius: 1, overflow: 'hidden', background: 'var(--bg-subtle)' }}>
                    {item.imageUrl && <img src={item.imageUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
                      {nl ? 'Verhuur' : 'Rental'}
                    </p>
                    <p style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 20, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{name}</p>
                    <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, color: 'var(--text-muted)' }}>
                      {nl ? 'Aantal' : 'Qty'}: {item.quantity} · {cart.startDate} → {cart.endDate}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 22, color: 'var(--text)', marginBottom: 8 }}>
                      €{(item.pricePerDay * item.quantity).toFixed(2)}
                    </p>
                    <button onClick={() => handleRemove(item.articleId)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-outfit)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                      {nl ? 'Verwijderen' : 'Remove'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary panel */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: 26, borderRadius: 2, position: 'sticky', top: 80 }}>
            <h2 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 22, fontWeight: 500, color: 'var(--text)', marginBottom: 22 }}>
              {nl ? 'Overzicht' : 'Summary'}
            </h2>
            {cart.items.map(item => (
              <div key={item.articleId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 9 }}>
                <span style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, color: 'var(--text-muted)' }}>
                  {nl ? item.nameNl : item.nameEn} ×{item.quantity}
                </span>
                <span style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, color: 'var(--text)' }}>
                  €{(item.pricePerDay * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 16, display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
              <span style={{ fontFamily: 'var(--font-outfit)', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                {nl ? 'Totaal' : 'Total'}
              </span>
              <span style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 26, color: 'var(--text)' }}>€{total.toFixed(2)}</span>
            </div>
            <Link href={checkoutPath} style={{ display: 'block', width: '100%', background: 'var(--accent)', color: 'var(--accent-text)', fontFamily: 'var(--font-outfit)', fontWeight: 500, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', padding: 15, textDecoration: 'none', textAlign: 'center', borderRadius: 1 }}>
              {nl ? 'Afrekenen' : 'Proceed to Checkout'}
            </Link>
            <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 14, lineHeight: 1.65 }}>
              {nl ? 'Leveringskosten worden berekend bij afrekening' : 'Delivery costs calculated at checkout'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
