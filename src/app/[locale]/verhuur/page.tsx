'use client'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArticleCard } from '@/components/catalog/ArticleCard'
import { CategoryFilter } from '@/components/catalog/CategoryFilter'
import type { Article, Category } from '@/lib/supabase/types'

function CatalogContent({ locale }: { locale: string }) {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const nl = locale === 'nl'
  const catalogPath = nl ? `/${locale}/verhuur` : `/${locale}/rental`

  useEffect(() => {
    const supabase = createClient()
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => setCategories(data ?? []))
    supabase.from('articles').select('*').eq('active', true).then(({ data }) => setArticles(data ?? []))
  }, [])

  const filtered = articles.filter(a => {
    const name = nl ? a.name_nl : a.name_en
    const matchesSearch = !search || name.toLowerCase().includes(search.toLowerCase())
    if (!activeCat) return matchesSearch
    const cat = categories.find(c => c.slug === activeCat)
    return matchesSearch && (!cat || a.category_id === cat.id)
  })

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '48px 80px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 11, letterSpacing: '0.2em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>
            {nl ? 'Aanbod' : 'Catalog'}
          </p>
          <h1 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 52, fontWeight: 500, color: 'var(--text)' }}>
            {nl ? 'Alle artikelen' : 'All Items'}
          </h1>
        </div>
        <Suspense>
          <CategoryFilter
            categories={categories}
            locale={locale}
            allLabel={nl ? 'Alles' : 'All'}
            search={search}
            onSearch={setSearch}
          />
        </Suspense>
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

export default function CatalogPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState('nl')
  useEffect(() => { params.then(p => setLocale(p.locale)) }, [params])
  return <CatalogContent locale={locale} />
}
