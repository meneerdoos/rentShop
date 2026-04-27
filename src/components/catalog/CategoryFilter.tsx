'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Category } from '@/lib/supabase/types'

interface CategoryFilterProps {
  categories: Category[]
  locale: string
  allLabel: string
  search: string
  onSearch: (q: string) => void
}

export function CategoryFilter({ categories, locale, allLabel, search, onSearch }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('category')

  function select(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) params.set('category', slug)
    else params.delete('category')
    router.push(`?${params.toString()}`)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 22 }}>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' as const }}>
        <PillBtn active={!active} onClick={() => select(null)}>{allLabel}</PillBtn>
        {categories.map(cat => (
          <PillBtn key={cat.id} active={active === cat.slug} onClick={() => select(cat.slug)}>
            {locale === 'nl' ? cat.name_nl : cat.name_en}
          </PillBtn>
        ))}
      </div>
      <input
        value={search}
        onChange={e => onSearch(e.target.value)}
        placeholder={locale === 'nl' ? 'Zoeken…' : 'Search…'}
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
  )
}

function PillBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: active ? 'var(--accent)' : hovered ? 'var(--bg-subtle)' : 'none',
        color: active ? 'var(--accent-text)' : 'var(--text-muted)',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        cursor: 'pointer',
        fontFamily: 'var(--font-outfit)',
        fontSize: 11,
        fontWeight: 500,
        padding: '6px 15px',
        letterSpacing: '0.07em',
        textTransform: 'uppercase' as const,
        transition: 'all 0.15s',
        borderRadius: 1,
      }}
    >
      {children}
    </button>
  )
}
