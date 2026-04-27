import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Article, Category } from '@/lib/supabase/types'
import type { Event } from '@/lib/supabase/types'

const STEPS = [
  ['01', 'Browse & select', 'Browse & kies', 'Explore our curated catalog and choose what you need for your event.', 'Ontdek ons aanbod en kies wat u nodig heeft voor uw evenement.'],
  ['02', 'Pick your dates', 'Kies uw data', 'Select your rental period. Delivery and pickup are arranged at checkout.', 'Selecteer uw huurperiode. Levering en ophaling worden bij afrekening geregeld.'],
  ['03', 'We deliver', 'Wij leveren', 'Your items arrive cleaned and ready to use. We set up if needed.', 'Uw artikelen worden schoon en gebruiksklaar geleverd.'],
  ['04', 'Return & done', 'Terugbrengen', 'We collect everything after your event. No cleaning required.', 'Wij halen alles op na uw evenement. Geen schoonmaak nodig.'],
]

function S(style: React.CSSProperties): React.CSSProperties { return style }

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = createServerSupabaseClient()
  const nl = locale === 'nl'

  const [{ data: categories }, { data: featured }] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('articles').select('*').eq('active', true).limit(4),
  ])
  // events table may not exist yet — fail gracefully
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(2)

  const catalogPath = nl ? `/${locale}/verhuur` : `/${locale}/rental`
  const storiesPath = nl ? `/${locale}/verhalen` : `/${locale}/stories`

  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center', padding: '88px 80px', maxWidth: 1320, margin: '0 auto' }}>
        <div>
          <p style={S({ fontFamily: 'var(--font-outfit)', fontSize: 11, letterSpacing: '0.22em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 22 })}>
            {nl ? 'Evenement verhuur · Antwerpen' : 'Event rental · Antwerp'}
          </p>
          <h1 style={S({ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 'clamp(50px,5.5vw,82px)', fontWeight: 600, color: 'var(--text)', lineHeight: 1.04, marginBottom: 28 })}>
            {nl ? <>Kleed uw<br /><em style={{ fontWeight: 300 }}>evenement</em><br />met zorg.</> : <>Dress your<br /><em style={{ fontWeight: 300 }}>event</em> with<br />intention.</>}
          </h1>
          <p style={S({ fontFamily: 'var(--font-outfit)', fontSize: 15, fontWeight: 300, color: 'var(--text-muted)', lineHeight: 1.85, maxWidth: 420, marginBottom: 40 })}>
            {nl
              ? 'Decoratie, meubels en tafelgerei voor elk evenement — bruiloften, galas, bedrijfsfeesten en intieme bijeenkomsten.'
              : 'Curated décor, furniture and tableware for every occasion — weddings, galas, corporate events and intimate gatherings.'}
          </p>
          <div style={{ display: 'flex', gap: 14 }}>
            <AccentBtn href={catalogPath}>{nl ? 'Bekijk aanbod' : 'Browse Catalog'}</AccentBtn>
            <OutlineBtn href="#how-it-works">{nl ? 'Hoe het werkt' : 'How it works'}</OutlineBtn>
          </div>
        </div>
        <div style={{ height: 500, borderRadius: 2, overflow: 'hidden', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '0 20px', lineHeight: 1.6 }}>
            hero — elegant event table setting
          </span>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      {categories && categories.length > 0 && (
        <section style={{ padding: '56px 80px', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 48, marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={S({ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 36, fontWeight: 500, color: 'var(--text)' })}>
              {nl ? 'Categorieën' : 'Browse by Category'}
            </h2>
            <Link href={catalogPath} style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none' }}>
              {nl ? 'Alles bekijken →' : 'View all →'}
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14 }}>
            {(categories as Category[]).map(cat => (
              <CategoryTile
                key={cat.id}
                name={nl ? cat.name_nl : cat.name_en}
                href={`${catalogPath}?category=${cat.slug}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Items ───────────────────────────────────────────────── */}
      {featured && featured.length > 0 && (
        <section style={{ padding: '56px 80px', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 48, marginBottom: 40 }}>
            <h2 style={S({ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 36, fontWeight: 500, color: 'var(--text)' })}>
              {nl ? 'Uitgelichte artikelen' : 'Featured Items'}
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 22 }}>
            {(featured as Article[]).map(article => (
              <FeaturedCard
                key={article.id}
                article={article}
                locale={locale}
                href={`${catalogPath}/${article.id}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Customer Stories teaser ──────────────────────────────────────── */}
      {events && events.length > 0 && (
        <section style={{ padding: '56px 80px', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 48, marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={S({ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 36, fontWeight: 500, color: 'var(--text)' })}>
              {nl ? 'Klantverhalen' : 'Customer Stories'}
            </h2>
            <Link href={storiesPath} style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none' }}>
              {nl ? 'Alle verhalen →' : 'All stories →'}
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 22 }}>
            {(events as Event[]).map(ev => (
              <StoryTeaser key={ev.id} ev={ev} locale={locale} storiesPath={storiesPath} />
            ))}
          </div>
        </section>
      )}

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: 'var(--bg-subtle)', padding: '80px', marginTop: 40 }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <h2 style={S({ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 36, fontWeight: 500, color: 'var(--text)', marginBottom: 56 })}>
            {nl ? 'Hoe het werkt' : 'How it works'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 44 }}>
            {STEPS.map(([n, titleEn, titleNl, descEn, descNl]) => (
              <div key={n}>
                <div style={S({ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 56, fontWeight: 300, color: 'var(--accent)', marginBottom: 14, lineHeight: 1 })}>{n}</div>
                <h3 style={S({ fontFamily: 'var(--font-outfit)', fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 10, letterSpacing: '0.04em' })}>{nl ? titleNl : titleEn}</h3>
                <p style={S({ fontFamily: 'var(--font-outfit)', fontSize: 13, fontWeight: 300, color: 'var(--text-muted)', lineHeight: 1.75 })}>{nl ? descNl : descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function AccentBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      display: 'inline-block',
      background: 'var(--accent)',
      color: 'var(--accent-text)',
      fontFamily: 'var(--font-outfit)',
      fontWeight: 500,
      fontSize: 13,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      padding: '15px 36px',
      textDecoration: 'none',
      borderRadius: 1,
      transition: 'background 0.18s',
    }}>
      {children}
    </Link>
  )
}

function OutlineBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      display: 'inline-block',
      background: 'none',
      color: 'var(--text)',
      fontFamily: 'var(--font-outfit)',
      fontWeight: 500,
      fontSize: 13,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      padding: '15px 36px',
      textDecoration: 'none',
      border: '1px solid var(--border)',
      borderRadius: 1,
    }}>
      {children}
    </Link>
  )
}

function CategoryTile({ name, href }: { name: string; href: string }) {
  return (
    <Link href={href} style={{
      display: 'block',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      cursor: 'pointer',
      borderRadius: 2,
      overflow: 'hidden',
      textDecoration: 'none',
    }}>
      <div style={{ height: 110, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', padding: '0 8px' }}>{name}</span>
      </div>
      <div style={{ padding: '11px 14px' }}>
        <span style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, fontWeight: 500, color: 'var(--text)', letterSpacing: '0.05em' }}>{name}</span>
      </div>
    </Link>
  )
}

function FeaturedCard({ article, locale, href }: { article: Article; locale: string; href: string }) {
  const name = locale === 'nl' ? article.name_nl : article.name_en
  return (
    <Link href={href} style={{
      display: 'block',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 2,
      overflow: 'hidden',
      textDecoration: 'none',
    }}>
      <div style={{ height: 220, background: 'var(--bg-subtle)', overflow: 'hidden', position: 'relative' }}>
        {article.image_url
          ? <img src={article.image_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'monospace', fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', padding: '0 16px' }}>{name}</div>
        }
      </div>
      <div style={{ padding: '16px 18px 20px' }}>
        <h3 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 21, fontWeight: 500, color: 'var(--text)', marginBottom: 6, lineHeight: 1.2 }}>{name}</h3>
        <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 13, color: 'var(--text-muted)' }}>
          {locale === 'nl' ? 'Vanaf ' : 'From '}
          <strong style={{ color: 'var(--text)', fontWeight: 500 }}>€{article.price_per_day}</strong>
          {locale === 'nl' ? ' / dag' : ' / day'}
        </p>
      </div>
    </Link>
  )
}

function StoryTeaser({ ev, locale, storiesPath }: { ev: Event; locale: string; storiesPath: string }) {
  return (
    <Link href={`${storiesPath}/${ev.id}`} style={{
      display: 'block',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 2,
      overflow: 'hidden',
      textDecoration: 'none',
    }}>
      <div style={{ height: 200, background: 'var(--bg-subtle)' }}>
        {ev.image_url && <img src={ev.image_url} alt={ev.customer_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div style={{ padding: '24px 26px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-outfit)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-text)', background: 'var(--accent)', padding: '4px 10px' }}>{ev.event_type}</span>
          <span style={{ fontFamily: 'var(--font-outfit)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '4px 10px' }}>{ev.event_date}</span>
        </div>
        <h3 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 22, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>{ev.customer_name}</h3>
        <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, color: 'var(--text-muted)' }}>{ev.location}</p>
      </div>
    </Link>
  )
}
