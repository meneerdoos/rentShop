import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Event } from '@/lib/supabase/types'

export default async function StoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const nl = locale === 'nl'
  const supabase = createServerSupabaseClient()
  const { data: events } = await supabase.from('events').select('*').order('created_at', { ascending: false })
  const storiesPath = nl ? `/${locale}/verhalen` : `/${locale}/stories`

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '48px 80px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 11, letterSpacing: '0.2em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 10 }}>
            {nl ? 'Echte evenementen' : 'Real Events'}
          </p>
          <h1 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 52, fontWeight: 500, color: 'var(--text)', marginBottom: 14 }}>
            {nl ? 'Klantverhalen' : 'Customer Stories'}
          </h1>
          <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', maxWidth: 480, lineHeight: 1.8 }}>
            {nl
              ? 'Elk evenement heeft een verhaal. Ontdek hoe onze klanten Kerkhofs-stukken gebruikten om iets onvergetelijks te creëren — en shop dezelfde artikelen.'
              : 'Every event tells a story. Browse how our customers used Kerkhofs pieces to create something unforgettable — and shop the same items.'}
          </p>
        </div>

        {(!events || events.length === 0) && (
          <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 60 }}>
            {nl ? 'Nog geen verhalen. Kom binnenkort terug.' : 'No stories yet. Check back soon.'}
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 28 }}>
          {((events as Event[]) ?? []).map((ev, i) => (
            <EventCard key={ev.id} ev={ev} featured={i === 0} storiesPath={storiesPath} />
          ))}
        </div>
      </div>
    </div>
  )
}

function EventCard({ ev, featured, storiesPath }: { ev: Event; featured: boolean; storiesPath: string }) {
  return (
    <Link
      href={`${storiesPath}/${ev.id}`}
      style={{
        display: 'block',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 2,
        overflow: 'hidden',
        textDecoration: 'none',
        gridColumn: featured ? 'span 2' : 'span 1',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: featured ? '1fr 1fr' : '1fr', alignItems: 'stretch' }}>
        <div style={{ height: featured ? 380 : 260, background: 'var(--bg-subtle)', overflow: 'hidden' }}>
          {ev.image_url
            ? <img src={ev.image_url} alt={ev.customer_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'monospace', fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', padding: '0 20px' }}>{ev.customer_name} — {ev.event_type}</div>
          }
        </div>
        <div style={{ padding: featured ? '40px 44px' : '24px 26px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-outfit)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-text)', background: 'var(--accent)', padding: '4px 10px' }}>{ev.event_type}</span>
            <span style={{ fontFamily: 'var(--font-outfit)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '4px 10px' }}>{ev.event_date}</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: featured ? 32 : 22, fontWeight: 500, color: 'var(--text)', marginBottom: 8, lineHeight: 1.15 }}>{ev.customer_name}</h2>
          <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, color: 'var(--text-muted)', marginBottom: featured ? 18 : 14 }}>{ev.location}</p>
          <p style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: featured ? 18 : 16, fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.65 }}>
            "{ev.quote.slice(0, 120)}{ev.quote.length > 120 ? '…' : ''}"
          </p>
        </div>
      </div>
    </Link>
  )
}
