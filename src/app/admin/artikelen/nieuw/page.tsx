import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ArticleForm } from '@/components/admin/ArticleForm'

export default async function NewArticlePage() {
  const supabase = createServerSupabaseClient()
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order')
  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Nieuw artikel</h1>
      <ArticleForm categories={categories ?? []} />
    </div>
  )
}
