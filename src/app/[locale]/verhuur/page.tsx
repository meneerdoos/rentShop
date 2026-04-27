import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ArticleCard } from '@/components/catalog/ArticleCard'
import { CategoryFilter } from '@/components/catalog/CategoryFilter'
import type { Article, Category } from '@/lib/supabase/types'

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const { locale } = await params
  const { category } = await searchParams
  const t = await getTranslations('catalog')
  const supabase = createServerSupabaseClient()

  const { data: categories } = await supabase.from('categories').select('*').order('sort_order')

  let query = supabase.from('articles').select('*').eq('active', true)
  if (category) {
    const cat = (categories as Category[])?.find(c => c.slug === category)
    if (cat) query = query.eq('category_id', cat.id)
  }
  const { data: articles } = await query

  const catalogPath = locale === 'nl' ? `/${locale}/verhuur` : `/${locale}/rental`

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-5xl font-black mb-8">{t('title')}</h1>
      <div className="mb-8">
        <Suspense>
          <CategoryFilter
            categories={(categories as Category[]) ?? []}
            locale={locale}
            allLabel={t('all')}
          />
        </Suspense>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {((articles as Article[]) ?? []).map(article => (
          <ArticleCard key={article.id} article={article} locale={locale} catalogPath={catalogPath} />
        ))}
      </div>
    </div>
  )
}
