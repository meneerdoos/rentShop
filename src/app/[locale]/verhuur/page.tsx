import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Article, Category } from '@/lib/supabase/types'
import { CatalogClient } from './CatalogClient'

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const { locale } = await params
  const { category } = await searchParams
  const supabase = createServerSupabaseClient()

  const [{ data: categories }, { data: articles }] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('articles').select('*').eq('active', true).order('name_nl'),
  ])

  return (
    <Suspense>
      <CatalogClient
        locale={locale}
        articles={(articles as Article[]) ?? []}
        categories={(categories as Category[]) ?? []}
        initialCategory={category ?? null}
      />
    </Suspense>
  )
}
