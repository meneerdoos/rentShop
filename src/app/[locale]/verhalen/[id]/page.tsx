import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Event, Article } from '@/lib/supabase/types'
import { ShoppableEvent } from './ShoppableEvent'

export default async function EventDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  const supabase = createServerSupabaseClient()

  const { data: ev } = await supabase.from('events').select('*').eq('id', id).single()
  if (!ev) notFound()

  const event = ev as Event
  let usedArticles: Article[] = []
  if (event.item_ids && event.item_ids.length > 0) {
    const { data: articles } = await supabase.from('articles').select('*').in('id', event.item_ids)
    usedArticles = (articles as Article[]) ?? []
  }

  return <ShoppableEvent event={event} usedArticles={usedArticles} locale={locale} />
}
