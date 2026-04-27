import { notFound } from 'next/navigation'
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

  const { data: related } = await supabase
    .from('articles')
    .select('*')
    .eq('active', true)
    .eq('category_id', article.category_id)
    .neq('id', article.id)
    .limit(3)

  return <ArticleDetailClient article={article as Article} locale={locale} relatedArticles={(related as Article[]) ?? []} />
}
