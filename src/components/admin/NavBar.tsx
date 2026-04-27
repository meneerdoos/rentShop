'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/artikelen', label: 'Artikelen' },
  { href: '/admin/categorieen', label: 'Categorieën' },
  { href: '/admin/bestellingen', label: 'Bestellingen' },
  { href: '/admin/verhalen', label: 'Verhalen' },
]

export function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="font-black text-lg">
          VERHUUR<span className="text-brand">/</span>ADMIN
        </span>
        <nav className="flex items-center gap-6 text-sm font-bold">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`pb-1 transition-colors ${
                pathname === link.href
                  ? 'text-brand border-b-2 border-brand'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-black ml-4 transition-colors"
          >
            Uitloggen
          </button>
        </nav>
      </div>
    </header>
  )
}
