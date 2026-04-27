'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addToCart } from '@/lib/cart'
import { calculateDays, calculateTotal } from '@/lib/availability'
import type { Article } from '@/lib/supabase/types'

const iStyle: React.CSSProperties = {
  background: 'var(--bg-input)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontFamily: 'var(--font-outfit)',
  fontSize: 13,
  padding: '11px 14px',
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

export function ArticleDetailClient({ article, locale, relatedArticles }: {
  article: Article
  locale: string
  relatedArticles?: Article[]
}) {
  const router = useRouter()
  const nl = locale === 'nl'
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [available, setAvailable] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)
  const catalogPath = nl ? `/${locale}/verhuur` : `/${locale}/rental`

  async function handleDateChange(field: 'start' | 'end', value: string) {
    const start = field === 'start' ? value : startDate
    const end = field === 'end' ? value : endDate
    if (field === 'start') setStartDate(value)
    else setEndDate(value)

    if (start && end) {
      setLoading(true)
      const res = await fetch(`/api/availability?articleId=${article.id}&startDate=${start}&endDate=${end}`)
      const data = await res.json()
      setAvailable(data.available ?? 0)
      setQuantity(1)
      setLoading(false)
    }
  }

  function handleAddToCart() {
    if (!startDate || !endDate || !available) return
    addToCart(
      { articleId: article.id, slug: article.id, nameNl: article.name_nl, nameEn: article.name_en, pricePerDay: article.price_per_day, quantity, imageUrl: article.image_url },
      startDate, endDate
    )
    window.dispatchEvent(new Event('cart-updated'))
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      router.push(nl ? `/${locale}/winkelwagen` : `/${locale}/cart`)
    }, 1200)
  }

  const days = startDate && endDate ? calculateDays(startDate, endDate) : 0
  const subtotal = days > 0 ? calculateTotal([{ pricePerDay: article.price_per_day, quantity }], startDate, endDate) : 0
  const name = nl ? article.name_nl : article.name_en

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '44px 80px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <button
          onClick={() => router.push(catalogPath)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-outfit)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 28, letterSpacing: '0.05em' }}
        >
          ← {nl ? 'Terug naar aanbod' : 'Back to catalog'}
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 460px', gap: 72, alignItems: 'start' }}>
          {/* Left — Images */}
          <div>
            <div style={{ height: 460, borderRadius: 2, marginBottom: 12, overflow: 'hidden', background: 'var(--bg-subtle)' }}>
              {article.image_url
                ? <img src={article.image_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{name}</div>
              }
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ height: 86, borderRadius: 1, overflow: 'hidden', background: 'var(--bg-subtle)' }} />
              ))}
            </div>
          </div>

          {/* Right — Sticky panel */}
          <div style={{ position: 'sticky', top: 80 }}>
            <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 10 }}>
              {nl ? 'Verhuur' : 'Rental'}
            </p>
            <h1 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 44, fontWeight: 500, color: 'var(--text)', lineHeight: 1.08, marginBottom: 14 }}>
              {name}
            </h1>
            <p style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 30, color: 'var(--text)', marginBottom: 22 }}>
              €{article.price_per_day}{' '}
              <span style={{ fontFamily: 'var(--font-outfit)', fontSize: 13, color: 'var(--text-muted)', fontWeight: 300 }}>
                / {nl ? 'dag' : 'day'}
              </span>
            </p>
            <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 13, fontWeight: 300, color: 'var(--text-muted)', lineHeight: 1.85, marginBottom: 28, borderBottom: '1px solid var(--border)', paddingBottom: 26 }}>
              {nl ? article.description_nl : article.description_en}
            </p>

            {/* Date inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={lStyle}>{nl ? 'Startdatum' : 'Start date'}</label>
                <input type="date" value={startDate} onChange={e => handleDateChange('start', e.target.value)} style={iStyle} />
              </div>
              <div>
                <label style={lStyle}>{nl ? 'Einddatum' : 'End date'}</label>
                <input type="date" value={endDate} onChange={e => handleDateChange('end', e.target.value)} style={iStyle} />
              </div>
            </div>

            {/* Loading / availability */}
            {loading && (
              <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                {nl ? 'Beschikbaarheid controleren…' : 'Checking availability…'}
              </p>
            )}
            {available !== null && !loading && (
              <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, marginBottom: 12, color: available === 0 ? '#e53e3e' : 'var(--text-muted)' }}>
                {available === 0
                  ? (nl ? 'Niet beschikbaar in deze periode' : 'Not available for this period')
                  : `${available} ${nl ? 'beschikbaar' : 'available'}`}
              </p>
            )}

            {/* Quantity stepper */}
            {available !== null && available > 0 && !loading && (
              <div style={{ marginBottom: 22 }}>
                <label style={lStyle}>{nl ? 'Aantal' : 'Quantity'}</label>
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 1 }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', width: 40, height: 40, fontSize: 18, fontFamily: 'var(--font-outfit)' }}>−</button>
                  <span style={{ width: 40, textAlign: 'center', fontFamily: 'var(--font-outfit)', fontSize: 15, color: 'var(--text)', fontWeight: 500 }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(available, q + 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', width: 40, height: 40, fontSize: 18, fontFamily: 'var(--font-outfit)' }}>+</button>
                </div>
              </div>
            )}

            {/* Subtotal */}
            {startDate && endDate && days > 0 && available !== null && available > 0 && (
              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', padding: '14px 18px', marginBottom: 18, borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {days} {nl ? `dag${days !== 1 ? 'en' : ''}` : `day${days !== 1 ? 's' : ''}`} · qty {quantity}
                </span>
                <span style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 28, color: 'var(--text)', fontWeight: 500 }}>€{subtotal.toFixed(2)}</span>
              </div>
            )}

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={!startDate || !endDate || !available || loading}
              style={{
                width: '100%',
                background: added ? 'var(--bg-subtle)' : 'var(--accent)',
                color: added ? 'var(--text)' : 'var(--accent-text)',
                border: `1px solid ${added ? 'var(--border)' : 'var(--accent)'}`,
                cursor: (!startDate || !endDate || !available || loading) ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-outfit)',
                fontWeight: 500,
                fontSize: 13,
                padding: 16,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'all 0.3s',
                borderRadius: 1,
                opacity: (!startDate || !endDate || !available) ? 0.5 : 1,
              }}
            >
              {added ? `✓  ${nl ? 'Toegevoegd' : 'Added to Cart'}` : (nl ? 'In winkelwagen' : 'Add to Cart')}
            </button>
            <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
              {nl ? 'Gratis levering boven €150 · Antwerpen & omgeving' : 'Free delivery over €150 · Antwerp & surroundings'}
            </p>
          </div>
        </div>

        {/* Related items */}
        {relatedArticles && relatedArticles.length > 0 && (
          <div style={{ marginTop: 72, borderTop: '1px solid var(--border)', paddingTop: 44 }}>
            <h2 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 32, fontWeight: 500, color: 'var(--text)', marginBottom: 28 }}>
              {nl ? 'Meer uit dezelfde categorie' : 'More in this category'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
              {relatedArticles.map(a => (
                <a key={a.id} href={`${catalogPath}/${a.id}`} style={{ display: 'block', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 2, overflow: 'hidden', textDecoration: 'none' }}>
                  <div style={{ height: 180, background: 'var(--bg-subtle)' }}>
                    {a.image_url && <img src={a.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <h3 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 18, fontWeight: 500, color: 'var(--text)' }}>{nl ? a.name_nl : a.name_en}</h3>
                    <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, color: 'var(--text-muted)' }}>€{a.price_per_day} / {nl ? 'dag' : 'day'}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
