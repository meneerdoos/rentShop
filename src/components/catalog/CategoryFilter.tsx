'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Category } from '@/lib/supabase/types'

interface CategoryFilterProps {
  categories: Category[]
  locale: string
  allLabel: string
}

export function CategoryFilter({ categories, locale, allLabel }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('category')

  function select(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set('category', slug)
    } else {
      params.delete('category')
    }
    router.push(`?${params.toString()}`)
  }

  const btnBase = 'px-4 py-2 border-2 font-black text-sm uppercase tracking-wide transition-colors'
  const activeStyle = 'bg-black text-white border-black'
  const inactiveStyle = 'border-black hover:bg-black hover:text-white'

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => select(null)}
        className={`${btnBase} ${!active ? activeStyle : inactiveStyle}`}
      >
        {allLabel}
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => select(cat.slug)}
          className={`${btnBase} ${active === cat.slug ? activeStyle : inactiveStyle}`}
        >
          {locale === 'nl' ? cat.name_nl : cat.name_en}
        </button>
      ))}
    </div>
  )
}
