'use client'
import { useState } from 'react'
import Link from 'next/link'
import { addToCart, getCart } from '@/lib/cart'
import type { Event, Article } from '@/lib/supabase/types'

export function ShoppableEvent({ event: ev, usedArticles, locale }: {
  event: Event
  usedArticles: Article[]
  locale: string
}) {
  const nl = locale === 'nl'
  const [activePin, setActivePin] = useState<number | null>(null)
  const [added, setAdded] = useState<Record<string, boolean>>({})
  const storiesPath = nl ? `/${locale}/verhalen` : `/${locale}/stories`
  const catalogPath = nl ? `/${locale}/verhuur` : `/${locale}/rental`

  function handleAdd(article: Article) {
    const cart = getCart()
    if (!cart.startDate || !cart.endDate) {
      window.location.href = `${catalogPath}/${article.id}`
      return
    }
    addToCart({ articleId: article.id, slug: article.id, nameNl: article.name_nl, nameEn: article.name_en, pricePerDay: article.price_per_day, quantity: 1, imageUrl: article.image_url }, cart.startDate, cart.endDate)
    window.dispatchEvent(new Event('cart-updated'))
    setAdded(a => ({ ...a, [article.id]: true }))
    setTimeout(() => setAdded(a => ({ ...a, [article.id]: false })), 2000)
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '44px 80px' }}>
      <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:0.4;}50%{transform:scale(1.4);opacity:0.1;}}`}</style>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <Link href={storiesPath} style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.05em', textDecoration: 'none', display: 'inline-block', marginBottom: 28 }}>
          ← {nl ? 'Terug naar verhalen' : 'Back to Stories'}
        </Link>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, borderBottom: '1px solid var(--border)', paddingBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <span style={{ fontFamily: 'var(--font-outfit)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-text)', background: 'var(--accent)', padding: '4px 10px' }}>{ev.event_type}</span>
              <span style={{ fontFamily: 'var(--font-outfit)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '4px 10px' }}>{ev.event_date} · {ev.location}</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 44, fontWeight: 500, color: 'var(--text)', lineHeight: 1.1 }}>{ev.customer_name}</h1>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 48, alignItems: 'start' }}>
          {/* Shoppable Photo */}
          <div>
            <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 12, textTransform: 'uppercase' }}>
              {nl ? 'Tik op de pins om artikelen te ontdekken' : 'Tap the pins to explore items used'}
            </p>
            <div
              style={{ position: 'relative', borderRadius: 2, overflow: 'hidden', aspectRatio: '4/3', background: 'var(--bg-subtle)' }}
              onClick={() => setActivePin(null)}
            >
              {ev.image_url
                ? <img src={ev.image_url} alt={ev.customer_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '0 20px' }}>{ev.customer_name} event photo</div>
              }

              {ev.hotspots.map((hs, idx) => {
                const article = usedArticles.find(a => a.id === hs.itemId)
                if (!article) return null
                const isActive = activePin === idx
                const name = nl ? article.name_nl : article.name_en
                return (
                  <div key={idx} style={{ position: 'absolute', left: `${hs.x}%`, top: `${hs.y}%`, transform: 'translate(-50%,-50%)', zIndex: 10 }}>
                    <button
                      onClick={e => { e.stopPropagation(); setActivePin(isActive ? null : idx) }}
                      style={{ width: 30, height: 30, borderRadius: '50%', background: isActive ? 'var(--accent)' : 'var(--bg)', border: '2px solid var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.3)', transition: 'all 0.2s', position: 'relative' }}
                    >
                      <span style={{ fontFamily: 'var(--font-outfit)', fontSize: 13, fontWeight: 700, color: isActive ? 'var(--accent-text)' : 'var(--accent)', lineHeight: 1 }}>+</span>
                      {!isActive && (
                        <span style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '1.5px solid var(--accent)', opacity: 0.4, animation: 'pulse 2s ease-in-out infinite' }} />
                      )}
                    </button>

                    {isActive && (
                      <div
                        onClick={e => e.stopPropagation()}
                        style={{ position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 2, padding: '14px 16px', width: 220, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 20 }}
                      >
                        <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                          {nl ? 'Verhuur' : 'Rental'}
                        </p>
                        <p style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 17, fontWeight: 500, color: 'var(--text)', marginBottom: 4, lineHeight: 1.2 }}>{name}</p>
                        <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>€{article.price_per_day} / {nl ? 'dag' : 'day'}</p>
                        <div style={{ display: 'flex', gap: 7 }}>
                          <Link href={`${catalogPath}/${article.id}`} style={{ flex: 1, background: 'none', border: '1px solid var(--border)', fontFamily: 'var(--font-outfit)', fontSize: 11, fontWeight: 500, padding: '7px 0', letterSpacing: '0.06em', color: 'var(--text)', textDecoration: 'none', textAlign: 'center', borderRadius: 1 }}>
                            {nl ? 'Bekijk' : 'View'}
                          </Link>
                          <button onClick={() => handleAdd(article)} style={{ flex: 1, background: added[article.id] ? 'var(--bg-subtle)' : 'var(--accent)', color: added[article.id] ? 'var(--text)' : 'var(--accent-text)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-outfit)', fontSize: 11, fontWeight: 500, padding: '7px 0', letterSpacing: '0.06em', transition: 'all 0.25s', borderRadius: 1 }}>
                            {added[article.id] ? '✓' : '+ Cart'}
                          </button>
                        </div>
                        {/* Popover arrow */}
                        <div style={{ position: 'absolute', bottom: -6, left: '50%', width: 10, height: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: 'none', borderLeft: 'none', transform: 'translateX(-50%) rotate(45deg)' }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Quote */}
            <blockquote style={{ margin: '28px 0 0', padding: '20px 24px', borderLeft: '3px solid var(--accent)', background: 'var(--bg-subtle)' }}>
              <p style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 20, fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.7, marginBottom: 10 }}>"{ev.quote}"</p>
              <cite style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, color: 'var(--text-muted)', fontStyle: 'normal', letterSpacing: '0.05em' }}>— {ev.customer_name}</cite>
            </blockquote>
          </div>

          {/* Shop this event sidebar */}
          <div style={{ position: 'sticky', top: 80 }}>
            <h2 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 26, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
              {nl ? 'Shop dit evenement' : 'Shop this event'}
            </h2>
            <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 22, lineHeight: 1.6 }}>
              {usedArticles.length} {nl ? 'artikelen gebruikt' : 'items used in this event'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {usedArticles.map(article => {
                const name = nl ? article.name_nl : article.name_en
                return (
                  <div key={article.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 1, padding: '14px 16px', display: 'grid', gridTemplateColumns: '52px 1fr', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 1, overflow: 'hidden', background: 'var(--bg-subtle)', flexShrink: 0 }}>
                      {article.image_url && <img src={article.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
                        {nl ? 'Verhuur' : 'Rental'}
                      </p>
                      <p style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 16, fontWeight: 500, color: 'var(--text)', marginBottom: 6, lineHeight: 1.2 }}>{name}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, color: 'var(--text-muted)' }}>€{article.price_per_day}/{nl ? 'dag' : 'day'}</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Link href={`${catalogPath}/${article.id}`} style={{ background: 'none', border: '1px solid var(--border)', fontFamily: 'var(--font-outfit)', fontSize: 10, fontWeight: 500, padding: '5px 10px', letterSpacing: '0.06em', color: 'var(--text)', textDecoration: 'none', borderRadius: 1 }}>
                            {nl ? 'Bekijk' : 'View'}
                          </Link>
                          <button onClick={() => handleAdd(article)} style={{ background: added[article.id] ? 'var(--bg-subtle)' : 'var(--accent)', color: added[article.id] ? 'var(--text)' : 'var(--accent-text)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-outfit)', fontSize: 10, fontWeight: 500, padding: '5px 10px', letterSpacing: '0.06em', borderRadius: 1, transition: 'all 0.25s' }}>
                            {added[article.id] ? '✓' : '+ Cart'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
