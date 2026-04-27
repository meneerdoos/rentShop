import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Article } from '@/lib/supabase/types'
import { ArticleDetailClient } from './ArticleDetailClient'

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const supabase = createServerSupabaseClient()
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('id', slug)
    .eq('active', true)
    .single()

  if (!article) notFound()

  const t = await getTranslations('detail')
  const name = locale === 'nl' ? article.name_nl : article.name_en
  const description = locale === 'nl' ? article.description_nl : article.description_en

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={name}
            className="w-full aspect-square object-cover border-4 border-black"
          />
        ) : (
          <div className="w-full aspect-square bg-gray-100 border-4 border-black flex items-center justify-center text-6xl">
            📦
          </div>
        )}
      </div>
      <div>
        <h1 className="text-4xl font-black mb-2">{name}</h1>
        <p className="text-3xl font-black text-brand mb-6">
          €{article.price_per_day}{' '}
          <span className="text-gray-400 font-normal text-lg">{t('perDay')}</span>
        </p>
        <p className="text-gray-600 mb-8">{description}</p>
        <ArticleDetailClient article={article as Article} locale={locale} />
      </div>
    </div>
  )
}
