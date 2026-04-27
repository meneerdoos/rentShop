'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Article, Event } from '@/lib/supabase/types'

const EVENT_TYPES = ['Wedding', 'Birthday Dinner', 'Corporate Gala', 'Brand Launch', 'Private Party', 'Other']

export default function AdminStoriesPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const blank = { customerName: '', eventType: 'Wedding', eventDate: '', location: '', quote: '', imageUrl: '', itemIds: [] as string[] }
  const [form, setForm] = useState(blank)

  useEffect(() => {
    fetch('/api/events').then(r => r.json()).then(setEvents)
    const supabase = createClient()
    supabase.from('articles').select('*').eq('active', true).then(({ data }) => setArticles(data ?? []))
  }, [])

  function set(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))
  }

  function toggleItem(id: string) {
    setForm(f => ({
      ...f,
      itemIds: f.itemIds.includes(id) ? f.itemIds.filter(i => i !== id) : [...f.itemIds, id],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.customerName || !form.quote) return
    setSaving(true)
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const newEv = await res.json()
      setEvents(evs => [newEv, ...evs])
      setForm(blank)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/events?id=${id}`, { method: 'DELETE' })
    setEvents(evs => evs.filter(e => e.id !== id))
  }

  const iStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14, outline: 'none', background: '#fff' }
  const lStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Klantverhalen</h1>

      {/* Add form */}
      <div className="bg-white rounded border border-gray-200 p-6 mb-8">
        <h2 className="font-black mb-6">Nieuw verhaal toevoegen</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label style={lStyle}>Naam klant</label>
              <input style={iStyle} value={form.customerName} onChange={set('customerName')} placeholder="Sarah & Tom Verhaegen" required />
            </div>
            <div>
              <label style={lStyle}>Type evenement</label>
              <select style={iStyle} value={form.eventType} onChange={set('eventType')}>
                {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={lStyle}>Datum</label>
              <input style={iStyle} value={form.eventDate} onChange={set('eventDate')} placeholder="Maart 2026" />
            </div>
            <div>
              <label style={lStyle}>Locatie</label>
              <input style={iStyle} value={form.location} onChange={set('location')} placeholder="Château, Antwerpen" />
            </div>
          </div>
          <div className="mb-4">
            <label style={lStyle}>Foto URL (optioneel)</label>
            <input style={iStyle} value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://…" />
          </div>
          <div className="mb-6">
            <label style={lStyle}>Citaat / verhaal</label>
            <textarea style={{ ...iStyle, minHeight: 90, resize: 'vertical' }} value={form.quote} onChange={set('quote')} placeholder="Het verhaal van de klant…" required />
          </div>
          <div className="mb-6">
            <label style={lStyle}>Gebruikte artikelen</label>
            <div className="grid grid-cols-3 gap-2">
              {articles.map(article => (
                <label key={article.id} className={`flex items-center gap-2 cursor-pointer p-2 border rounded text-sm transition-colors ${form.itemIds.includes(article.id) ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                  <input type="checkbox" checked={form.itemIds.includes(article.id)} onChange={() => toggleItem(article.id)} />
                  {article.name_nl}
                </label>
              ))}
            </div>
          </div>
          <button type="submit" disabled={saving} className="bg-black text-white font-black uppercase tracking-wide px-6 py-3 hover:bg-gray-800 transition-colors disabled:opacity-50">
            {saved ? '✓ Toegevoegd' : saving ? '…' : '+ Toevoegen'}
          </button>
        </form>
      </div>

      {/* Events list */}
      <div className="bg-white rounded border border-gray-200 p-6">
        <h2 className="font-black mb-4">Alle verhalen ({events.length})</h2>
        <div className="flex flex-col gap-3">
          {events.map(ev => (
            <div key={ev.id} className="flex justify-between items-center border border-gray-100 rounded p-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wide text-gray-400 mr-3">{ev.event_type}</span>
                <span className="font-bold">{ev.customer_name}</span>
                <span className="text-sm text-gray-400 ml-3">{ev.event_date} · {ev.location}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">{ev.item_ids?.length ?? 0} artikelen</span>
                <button onClick={() => handleDelete(ev.id)} className="border border-gray-200 text-gray-400 text-sm px-3 py-1 rounded hover:border-red-300 hover:text-red-500 transition-colors">
                  Verwijderen
                </button>
              </div>
            </div>
          ))}
          {events.length === 0 && <p className="text-gray-400 text-sm">Nog geen verhalen.</p>}
        </div>
      </div>
    </div>
  )
}
