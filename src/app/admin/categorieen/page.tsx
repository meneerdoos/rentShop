import { createServerSupabaseClient } from '@/lib/supabase/server'
import { CategoryForm } from '@/components/admin/CategoryForm'
import type { Category } from '@/lib/supabase/types'

export default async function CategoriesPage() {
  const supabase = createServerSupabaseClient()
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order')

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Categorieën</h1>
      <div className="bg-white rounded border border-gray-200 p-6 mb-8">
        <h2 className="font-black mb-4">Nieuwe categorie</h2>
        <CategoryForm />
      </div>
      <div className="bg-white rounded border border-gray-200 p-6">
        <h2 className="font-black mb-6">Bestaande categorieën</h2>
        <div className="flex flex-col gap-6">
          {((categories as Category[]) ?? []).map(cat => (
            <div key={cat.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
              <CategoryForm category={cat} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
