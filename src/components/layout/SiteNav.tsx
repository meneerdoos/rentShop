'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme, type Theme } from '@/contexts/ThemeContext'
import { getCart } from '@/lib/cart'

const THEMES: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'warm', label: 'Warm' },
]

export function SiteNav({ locale }: { locale: string }) {
  const { theme, setTheme } = useTheme()
  const [cartCount, setCartCount] = useState(0)
  const [hoverCart, setHoverCart] = useState(false)

  useEffect(() => {
    function update() {
      setCartCount(getCart()?.items?.length ?? 0)
    }
    update()
    window.addEventListener('storage', update)
    window.addEventListener('cart-updated', update)
    return () => {
      window.removeEventListener('storage', update)
      window.removeEventListener('cart-updated', update)
    }
  }, [])

  const catalogPath = locale === 'nl' ? `/${locale}/verhuur` : `/${locale}/rental`
  const cartPath = locale === 'nl' ? `/${locale}/winkelwagen` : `/${locale}/cart`
  const storiesPath = locale === 'nl' ? `/${locale}/verhalen` : `/${locale}/stories`
  const otherLocale = locale === 'nl' ? 'en' : 'nl'

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 200,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 56px',
        height: 64,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Logo */}
      <Link
        href={`/${locale}`}
        style={{
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          fontWeight: 600,
          fontSize: 20,
          color: 'var(--text)',
          letterSpacing: '0.06em',
          textDecoration: 'none',
        }}
      >
        KERKHOFS{' '}
        <em style={{ color: 'var(--accent)', fontWeight: 400 }}>deco &amp; rent</em>
      </Link>

      {/* Right side */}
      <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        <NavLink href={catalogPath}>{locale === 'nl' ? 'Aanbod' : 'Browse'}</NavLink>
        <NavLink href={storiesPath}>{locale === 'nl' ? 'Verhalen' : 'Stories'}</NavLink>

        {/* Theme switcher */}
        <div style={{ display: 'flex', gap: 4 }}>
          {THEMES.map(t => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              title={t.label}
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: theme === t.value ? '2px solid var(--accent)' : '2px solid var(--border)',
                cursor: 'pointer',
                background: t.value === 'light' ? '#f6f4f0' : t.value === 'dark' ? '#0d0b09' : '#f0e8d8',
                transition: 'border-color 0.15s',
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Language */}
        <NavLink href={`/${otherLocale}`}>
          {otherLocale.toUpperCase()}
        </NavLink>

        {/* Cart */}
        <Link
          href={cartPath}
          onMouseEnter={() => setHoverCart(true)}
          onMouseLeave={() => setHoverCart(false)}
          style={{
            position: 'relative',
            background: hoverCart ? 'var(--accent)' : 'none',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            fontFamily: 'var(--font-outfit)',
            fontSize: 12,
            fontWeight: 500,
            color: hoverCart ? 'var(--accent-text)' : 'var(--text)',
            padding: '8px 20px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase' as const,
            transition: 'all 0.18s',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {locale === 'nl' ? 'Wagen' : 'Cart'}
          {cartCount > 0 && (
            <span
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-text)',
                borderRadius: '50%',
                width: 17,
                height: 17,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'var(--font-outfit)',
        fontSize: 13,
        color: hovered ? 'var(--text)' : 'var(--text-muted)',
        letterSpacing: '0.06em',
        transition: 'color 0.15s',
        textDecoration: 'none',
      }}
    >
      {children}
    </Link>
  )
}
