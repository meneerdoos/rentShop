import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Cormorant_Garamond, Outfit } from 'next/font/google'
import { routing } from '@/i18n/routing'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SiteNav } from '@/components/layout/SiteNav'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-outfit',
  display: 'swap',
})

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <div className={`${cormorant.variable} ${outfit.variable} min-h-screen bg-th-bg`}>
          <SiteNav locale={locale} />
          <main>{children}</main>
          <footer
            style={{
              borderTop: '1px solid var(--border)',
              padding: '36px 80px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-cormorant), Georgia, serif',
                fontWeight: 600,
                fontSize: 16,
                color: 'var(--text)',
                letterSpacing: '0.06em',
              }}
            >
              KERKHOFS <em style={{ fontWeight: 300 }}>deco &amp; rent</em>
            </span>
            <span style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, color: 'var(--text-muted)' }}>
              © 2026 · Antwerp, Belgium
            </span>
          </footer>
        </div>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
