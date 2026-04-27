'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Category } from '@/lib/supabase/types'

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({
    name_nl: category?.name_nl ?? '',
    name_en: category?.name_en ?? '',
    slug: category?.slug ?? '',
    sort_order: category?.sort_order?.toString() ?? '0',
  })
  const [saving, setSaving] = useState(false)

  function set(field: string, value: string) {
    setForm(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'name_nl' && !category
        ? { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }
        : {}),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name_nl: form.name_nl,
      name_en: form.name_en,
      slug: form.slug,
      sort_order: parseInt(form.sort_order),
    }
    if (category) {
      await supabase.from('categories').update(payload).eq('id', category.id)
    } else {
      await supabase.from('categories').insert(payload)
    }
    router.refresh()
    setSaving(false)
    if (!category) setForm({ name_nl: '', name_en: '', slug: '', sort_order: '0' })
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4 items-end">
      <Input label="Naam (NL)" id={`name_nl_${category?.id ?? 'new'}`} value={form.name_nl} onChange={e => set('name_nl', e.target.value)} required />
      <Input label="Name (EN)" id={`name_en_${category?.id ?? 'new'}`} value={form.name_en} onChange={e => set('name_en', e.target.value)} required />
      <Input label="Slug" id={`slug_${category?.id ?? 'new'}`} value={form.slug} onChange={e => set('slug', e.target.value)} required />
      <Input label="Volgorde" id={`order_${category?.id ?? 'new'}`} type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} />
      <Button type="submit" disabled={saving}>{saving ? '…' : category ? 'Opslaan' : '+ Toevoegen'}</Button>
    </form>
  )
}
