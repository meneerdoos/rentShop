'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white border border-gray-200 rounded p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-2xl font-black mb-6">
          VERHUUR<span className="text-brand">/</span>ADMIN
        </h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            label="E-mail"
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            label="Wachtwoord"
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-brand text-white font-black uppercase tracking-widest py-3 hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Bezig…' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  )
}
