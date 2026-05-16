import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { calculateDays } from '@/lib/availability'
import { getStripe } from '@/lib/stripe'

interface BookingItem {
  articleId: string
  quantity: number
  pricePerDay: number
}

export async function POST(req: NextRequest) {
  const {
    customerName, customerEmail, customerPhone,
    deliveryAddress, deliveryCity, eventDate, notes,
    items, startDate, endDate, locale = 'nl'
  } = await req.json() as {
    customerName: string
    customerEmail: string
    customerPhone: string
    deliveryAddress: string
    deliveryCity: string
    eventDate: string
    notes: string
    items: BookingItem[]
    startDate: string
    endDate: string
    locale?: string
  }

  const supabase = createServiceClient()

  // 1. Check availability
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

  const deliveryNote = [
    deliveryAddress && `Adres: ${deliveryAddress}`,
    deliveryCity && `Stad: ${deliveryCity}`,
    eventDate && `Evenementdatum: ${eventDate}`,
    notes,
  ].filter(Boolean).join('\n')

  // 2. Create order in pending_payment state
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      start_date: startDate,
      end_date: endDate,
      total_price: totalPrice,
      status: 'pending_payment',
      notes: deliveryNote,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 3. Insert order items
  await supabase.from('order_items').insert(
    items.map(i => ({
      order_id: order.id,
      article_id: i.articleId,
      quantity: i.quantity,
      price_per_day: i.pricePerDay,
    }))
  )

  // 4. Create Stripe PaymentIntent
  const paymentIntent = await getStripe().paymentIntents.create({
    amount: Math.round(totalPrice * 100),
    currency: 'eur',
    metadata: {
      orderId: order.id,
      locale,
    },
  })

  // 5. Update order with Stripe Payment ID
  await supabase
    .from('orders')
    .update({ stripe_payment_id: paymentIntent.id })
    .eq('id', order.id)

  return NextResponse.json({ 
    orderId: order.id,
    clientSecret: paymentIntent.client_secret 
  })
}
