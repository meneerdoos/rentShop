import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { customerName, eventType, eventDate, location, quote, imageUrl, itemIds } = body

  if (!customerName || !eventType || !quote) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const hotspots = (itemIds as string[]).slice(0, 4).map((itemId: string, i: number) => ({
    x: 20 + i * 20,
    y: 30 + i * 15,
    itemId,
  }))

  const supabase = createServiceClient()
  const { data, error } = await supabase.from('events').insert({
    customer_name: customerName,
    event_type: eventType,
    event_date: eventDate,
    location,
    quote,
    image_url: imageUrl || null,
    item_ids: itemIds ?? [],
    hotspots,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const supabase = createServiceClient()
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
