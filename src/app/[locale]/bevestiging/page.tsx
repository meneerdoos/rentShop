'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { clearCart } from '@/lib/cart'

export default function ConfirmationPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState('nl')

  useEffect(() => {
    params.then(p => setLocale(p.locale))
    localStorage.removeItem('pending_order_id')
    clearCart()
    window.dispatchEvent(new Event('cart-updated'))
  }, [params])

  const nl = locale === 'nl'
  const homePath = `/${locale}`

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: 40, textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        <span style={{ fontFamily: 'var(--font-outfit)', fontSize: 28, color: 'var(--accent)' }}>✓</span>
      </div>
      <h1 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 50, fontWeight: 500, color: 'var(--text)' }}>
        {nl ? 'Boeking bevestigd' : 'Booking Confirmed'}
      </h1>
      <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', maxWidth: 420, lineHeight: 1.85 }}>
        {nl
          ? 'Bedankt voor uw boeking. We sturen een bevestiging per e-mail en nemen contact op over de levering.'
          : "Thank you for your booking. We'll send a confirmation by email and follow up with delivery details."}
      </p>
      <Link href={homePath} style={{ display: 'inline-block', background: 'var(--accent)', color: 'var(--accent-text)', fontFamily: 'var(--font-outfit)', fontWeight: 500, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '14px 36px', textDecoration: 'none', borderRadius: 1, marginTop: 12 }}>
        {nl ? 'Terug naar home' : 'Back to Home'}
      </Link>
    </div>
  )
}
