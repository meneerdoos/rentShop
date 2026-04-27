'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Article, Category } from '@/lib/supabase/types'

interface ArticleFormProps {
  article?: Article
  categories: Category[]
}

export function ArticleForm({ article, categories }: ArticleFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({
    name_nl: article?.name_nl ?? '',
    name_en: article?.name_en ?? '',
    description_nl: article?.description_nl ?? '',
    description_en: article?.description_en ?? '',
    price_per_day: article?.price_per_day?.toString() ?? '',
    stock_quantity: article?.stock_quantity?.toString() ?? '',
    category_id: article?.category_id ?? categories[0]?.id ?? '',
    active: article?.active ?? true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    let image_url = article?.image_url ?? ''
    if (imageFile) {
      const path = `${Date.now()}-${imageFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(path, imageFile)
      if (uploadError) {
        setError(uploadError.message)
        setSaving(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(path)
      image_url = publicUrl
    }

    const payload = {
      name_nl: form.name_nl,
      name_en: form.name_en,
      description_nl: form.description_nl,
      description_en: form.description_en,
      price_per_day: parseFloat(form.price_per_day),
      stock_quantity: parseInt(form.stock_quantity),
      category_id: form.category_id,
      active: form.active,
      image_url,
    }

    if (article) {
      const { error } = await supabase.from('articles').update(payload).eq('id', article.id)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('articles').insert(payload)
      if (error) { setError(error.message); setSaving(false); return }
    }

    router.push('/admin/artikelen')
    router.refresh()
  }

  async function handleDelete() {
    if (!article) return
    const { data: items } = await supabase
      .from('order_items')
      .select('id, orders!inner(status)')
      .eq('article_id', article.id)
      .eq('orders.status', 'confirmed')
      .limit(1)

    if (items && items.length > 0) {
      setError('Kan niet verwijderen: er zijn actieve boekingen. Deactiveer het artikel.')
      return
    }
    await supabase.from('articles').delete().eq('id', article.id)
    router.push('/admin/artikelen')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      {error && (
        <p className="text-red-500 border-2 border-red-500 p-3 font-bold">{error}</p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Naam (NL)" id="name_nl" value={form.name_nl} onChange={e => set('name_nl', e.target.value)} required />
        <Input label="Name (EN)" id="name_en" value={form.name_en} onChange={e => set('name_en', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase tracking-widest">Omschrijving (NL)</label>
          <textarea
            className="border-2 border-black px-4 py-2 h-24 resize-none focus:outline-none focus:border-brand"
            value={form.description_nl}
            onChange={e => set('description_nl', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase tracking-widest">Description (EN)</label>
          <textarea
            className="border-2 border-black px-4 py-2 h-24 resize-none focus:outline-none focus:border-brand"
            value={form.description_en}
            onChange={e => set('description_en', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Input label="Prijs per dag (€)" id="price" type="number" step="0.01" min="0" value={form.price_per_day} onChange={e => set('price_per_day', e.target.value)} required />
        <Input label="Voorraad" id="stock" type="number" min="0" value={form.stock_quantity} onChange={e => set('stock_quantity', e.target.value)} required />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase tracking-widest">Categorie</label>
          <select
            className="border-2 border-black px-4 py-2 focus:outline-none focus:border-brand"
            value={form.category_id}
            onChange={e => set('category_id', e.target.value)}
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name_nl}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-black uppercase tracking-widest">Foto</label>
        {article?.image_url && (
          <img src={article.image_url} className="w-24 h-24 object-cover border-2 border-black mb-2" alt="" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={e => setImageFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="active"
          checked={form.active}
          onChange={e => set('active', e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="active" className="font-black text-sm uppercase tracking-wide">
          Actief (zichtbaar in catalogus)
        </label>
      </div>
      <div className="flex gap-4">
        <Button type="submit" disabled={saving}>{saving ? 'Opslaan…' : 'Opslaan'}</Button>
        {article && (
          <Button type="button" variant="outline" onClick={handleDelete}>Verwijderen</Button>
        )}
      </div>
    </form>
  )
}
