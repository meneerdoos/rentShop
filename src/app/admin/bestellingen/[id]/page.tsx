import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import type { Order } from '@/lib/supabase/types'

async function cancelOrder(orderId: string) {
  'use server'
  const supabase = createServerSupabaseClient()
  await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId)
  redirect('/admin/bestellingen')
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServerSupabaseClient()
  const { data: order } = await supabase.from('orders').select('*').eq('id', id).single()
  if (!order) notFound()

  const { data: items } = await supabase
    .from('order_items')
    .select('*, articles(name_nl, name_en)')
    .eq('order_id', id)

  const o = order as Order

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-black mb-2">
        Bestelling #{o.id.slice(0, 8).toUpperCase()}
      </h1>
      <div className="mb-6">
        <Badge variant={o.status as 'confirmed' | 'pending_payment' | 'cancelled'} />
      </div>

      <div className="bg-white rounded border border-gray-200 p-6 mb-6">
        <h2 className="font-black mb-4">Klantgegevens</h2>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-gray-400">Naam</dt>
          <dd className="font-bold">{o.customer_name}</dd>
          <dt className="text-gray-400">E-mail</dt>
          <dd>{o.customer_email}</dd>
          <dt className="text-gray-400">Telefoon</dt>
          <dd>{o.customer_phone}</dd>
          <dt className="text-gray-400">Periode</dt>
          <dd>{o.start_date} t/m {o.end_date}</dd>
          <dt className="text-gray-400">Stripe ID</dt>
          <dd className="font-mono text-xs break-all">{o.stripe_payment_id}</dd>
        </dl>
      </div>

      <div className="bg-white rounded border border-gray-200 p-6 mb-6">
        <h2 className="font-black mb-4">Artikelen</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase">
              <th className="text-left py-2">Artikel</th>
              <th className="text-left py-2">Aantal</th>
              <th className="text-left py-2">Prijs/dag</th>
            </tr>
          </thead>
          <tbody>
            {(items ?? []).map((item: any) => (
              <tr key={item.id} className="border-b border-gray-50">
                <td className="py-3">{item.articles?.name_nl}</td>
                <td className="py-3">{item.quantity}</td>
                <td className="py-3">€ {item.price_per_day}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 font-black text-right">
          Totaal: €{Number(o.total_price).toFixed(2)}
        </p>
      </div>

      {o.status !== 'cancelled' && (
        <form action={cancelOrder.bind(null, o.id)}>
          <button
            type="submit"
            className="border-2 border-red-500 text-red-500 font-black uppercase px-6 py-3 hover:bg-red-500 hover:text-white transition-colors"
          >
            Bestelling annuleren
          </button>
        </form>
      )}
    </div>
  )
}
