import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { sendBookingConfirmation } from '@/lib/resend'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = (await headers()).get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    const supabase = createServiceClient()

    const { data: order } = await supabase
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('stripe_payment_id', pi.id)
      .select()
      .single()

    if (order) {
      await sendBookingConfirmation({
        to: order.customer_email,
        customerName: order.customer_name,
        orderId: order.id,
        startDate: order.start_date,
        endDate: order.end_date,
        totalPrice: order.total_price,
        locale: pi.metadata.locale ?? 'nl',
      })
    }
  }

  return NextResponse.json({ received: true })
}
