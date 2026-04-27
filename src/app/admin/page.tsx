import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/admin/StatsCard'
import { Badge } from '@/components/ui/Badge'
import type { Order } from '@/lib/supabase/types'

export default async function AdminDashboard() {
  const supabase = createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0]

  const [
    { count: todayCount },
    { count: upcomingCount },
    { count: activeCount },
    { data: recent },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'confirmed').gte('created_at', today),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'confirmed').gte('start_date', today),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('orders').select('total_price').eq('status', 'confirmed').gte('created_at', `${today.slice(0, 7)}-01`),
  ])

  const monthRevenue = (revenueData ?? []).reduce(
    (sum: number, o: { total_price: number }) => sum + Number(o.total_price),
    0
  )

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatsCard label="Bestellingen vandaag" value={todayCount ?? 0} />
        <StatsCard label="Aankomend" value={upcomingCount ?? 0} />
        <StatsCard label="Omzet (maand)" value={`€ ${monthRevenue.toFixed(0)}`} accent />
        <StatsCard label="Actieve artikelen" value={activeCount ?? 0} />
      </div>

      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-black">Recente bestellingen</h2>
          <Link href="/admin/bestellingen" className="text-brand text-sm font-bold hover:underline">
            Alle bestellingen →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['#', 'Klant', 'Periode', 'Totaal', 'Status', ''].map(h => (
                <th
                  key={h}
                  className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {((recent as Order[]) ?? []).map(order => (
              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                  {order.id.slice(0, 8).toUpperCase()}
                </td>
                <td className="px-6 py-4 font-bold">{order.customer_name}</td>
                <td className="px-6 py-4 text-gray-500">
                  {order.start_date} – {order.end_date}
                </td>
                <td className="px-6 py-4 font-bold">€ {Number(order.total_price).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <Badge variant={order.status as 'confirmed' | 'pending_payment' | 'cancelled'} />
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/bestellingen/${order.id}`}
                    className="text-brand font-bold hover:underline"
                  >
                    Bekijk →
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
