import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import type { Order } from '@/lib/supabase/types'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const supabase = createServerSupabaseClient()
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data: orders } = await query

  const statuses = [
    { value: '', label: 'Alle' },
    { value: 'confirmed', label: 'Bevestigd' },
    { value: 'pending_payment', label: 'In behandeling' },
    { value: 'cancelled', label: 'Geannuleerd' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Bestellingen</h1>
      <div className="flex gap-2 mb-6">
        {statuses.map(s => (
          <Link
            key={s.value}
            href={s.value ? `?status=${s.value}` : '/admin/bestellingen'}
            className={`px-4 py-2 border-2 font-black text-sm uppercase transition-colors ${
              status === s.value || (!status && !s.value)
                ? 'bg-black text-white border-black'
                : 'border-black hover:bg-black hover:text-white'
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['#', 'Klant', 'E-mail', 'Periode', 'Totaal', 'Status', ''].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {((orders as Order[]) ?? []).map(order => (
              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-400 font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</td>
                <td className="px-6 py-4 font-bold">{order.customer_name}</td>
                <td className="px-6 py-4 text-gray-500">{order.customer_email}</td>
                <td className="px-6 py-4 text-gray-500">{order.start_date} – {order.end_date}</td>
                <td className="px-6 py-4 font-bold">€ {Number(order.total_price).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <Badge variant={order.status as 'confirmed' | 'pending_payment' | 'cancelled'} />
                </td>
                <td className="px-6 py-4">
                  <Link href={`/admin/bestellingen/${order.id}`} className="text-brand font-bold hover:underline">Bekijk →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
