'use client'
import { useState } from 'react'
import { ArticleCard } from '@/components/catalog/ArticleCard'
import type { Article, Category } from '@/lib/supabase/types'

interface Props {
  locale: string
  articles: Article[]
  categories: Category[]
  initialCategory: string | null
}

export function CatalogClient({ locale, articles, categories, initialCategory }: Props) {
  const [activeSlug, setActiveSlug] = useState<string | null>(initialCategory)
  const [search, setSearch] = useState('')
  const nl = locale === 'nl'
  const catalogPath = nl ? `/${locale}/verhuur` : `/${locale}/rental`

  const activeCategory = categories.find(c => c.slug === activeSlug) ?? null

  const filtered = articles.filter(a => {
    const name = nl ? a.name_nl : a.name_en
    const matchesSearch = !search || name.toLowerCase().includes(search.toLowerCase())
    const matchesCat = !activeCategory || a.category_id === activeCategory.id
    return matchesSearch && matchesCat
  })

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '48px 80px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 11, letterSpacing: '0.2em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>
            {nl ? 'Aanbod' : 'Catalog'}
          </p>
          <h1 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 52, fontWeight: 500, color: 'var(--text)' }}>
            {nl ? 'Alle artikelen' : 'All Items'}
          </h1>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 22 }}>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <PillBtn active={!activeSlug} onClick={() => setActiveSlug(null)}>
              {nl ? 'Alles' : 'All'}
            </PillBtn>
            {categories.map(cat => (
              <PillBtn key={cat.id} active={activeSlug === cat.slug} onClick={() => setActiveSlug(cat.slug)}>
                {nl ? cat.name_nl : cat.name_en}
              </PillBtn>
            ))}
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={nl ? 'Zoeken…' : 'Search…'}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontFamily: 'var(--font-outfit)',
              fontSize: 13,
              padding: '9px 16px',
              outline: 'none',
              width: 200,
              borderRadius: 1,
            }}
          />
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 22 }}>
          {filtered.map(article => (
            <ArticleCard key={article.id} article={article} locale={locale} catalogPath={catalogPath} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-outfit)', textAlign: 'center', paddingTop: 80, fontSize: 15 }}>
            {nl ? 'Geen artikelen gevonden.' : 'No items found.'}
          </p>
        )}
      </div>
    </div>
  )
}

function PillBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'var(--accent)' : 'none',
        color: active ? 'var(--accent-text)' : 'var(--text-muted)',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        cursor: 'pointer',
        fontFamily: 'var(--font-outfit)',
        fontSize: 11,
        fontWeight: 500,
        padding: '6px 15px',
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        transition: 'all 0.15s',
        borderRadius: 1,
      }}
    >
      {children}
    </button>
  )
}
