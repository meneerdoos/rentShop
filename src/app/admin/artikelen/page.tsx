import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'

export default async function ArticlesPage() {
  const supabase = createServerSupabaseClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('*, categories(name_nl)')
    .order('name_nl')

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">Artikelen</h1>
        <Link href="/admin/artikelen/nieuw">
          <Button>+ Nieuw artikel</Button>
        </Link>
      </div>
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Naam', 'Categorie', 'Prijs/dag', 'Voorraad', 'Status', ''].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(articles ?? []).map((a: any) => (
              <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4 font-bold">{a.name_nl}</td>
                <td className="px-6 py-4 text-gray-500">{a.categories?.name_nl}</td>
                <td className="px-6 py-4">€ {a.price_per_day}</td>
                <td className="px-6 py-4">{a.stock_quantity}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${a.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {a.active ? 'Actief' : 'Inactief'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/admin/artikelen/${a.id}`} className="text-brand font-bold hover:underline">
                    Bewerk →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
