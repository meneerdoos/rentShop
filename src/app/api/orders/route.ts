import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { calculateDays } from '@/lib/availability'

interface OrderItem {
  articleId: string
  quantity: number
  pricePerDay: number
}

export async function POST(req: NextRequest) {
  const { customerName, customerEmail, customerPhone, items, startDate, endDate, locale } =
    await req.json() as {
      customerName: string
      customerEmail: string
      customerPhone: string
      items: OrderItem[]
      startDate: string
      endDate: string
      locale: string
    }

  const supabase = createServiceClient()

  for (const item of items) {
    const { data: available } = await supabase.rpc('get_available_quantity', {
      p_article_id: item.articleId,
      p_start_date: startDate,
      p_end_date: endDate,
    })
    if ((available as number) < item.quantity) {
      return NextResponse.json({ error: 'out_of_stock' }, { status: 409 })
    }
  }

  const days = calculateDays(startDate, endDate)
  const totalPrice = items.reduce((sum, i) => sum + i.pricePerDay * i.quantity * days, 0)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalPrice * 100),
    currency: 'eur',
    metadata: { customerEmail, locale },
  })

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      start_date: startDate,
      end_date: endDate,
      total_price: totalPrice,
      stripe_payment_id: paymentIntent.id,
      status: 'pending_payment',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('order_items').insert(
    items.map(i => ({
      order_id: order.id,
      article_id: i.articleId,
      quantity: i.quantity,
      price_per_day: i.pricePerDay,
    }))
  )

  return NextResponse.json({ orderId: order.id, clientSecret: paymentIntent.client_secret })
}
