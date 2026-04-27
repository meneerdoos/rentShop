import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ArticleForm } from '@/components/admin/ArticleForm'

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServerSupabaseClient()
  const [{ data: article }, { data: categories }] = await Promise.all([
    supabase.from('articles').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('sort_order'),
  ])
  if (!article) notFound()
  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Artikel bewerken</h1>
      <ArticleForm article={article} categories={categories ?? []} />
    </div>
  )
}
