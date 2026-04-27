import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { routing } from '@/i18n/routing'

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
  const t = await getTranslations('nav')

  const catalogPath = locale === 'nl' ? `/${locale}/verhuur` : `/${locale}/rental`
  const cartPath = locale === 'nl' ? `/${locale}/winkelwagen` : `/${locale}/cart`

  return (
    <NextIntlClientProvider messages={messages}>
      <header className="border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/${locale}`} className="text-xl font-black tracking-tight">
            VERHUUR<span className="text-brand">/</span>
          </Link>
          <nav className="flex items-center gap-8 text-sm font-black uppercase tracking-widest">
            <Link href={catalogPath} className="hover:text-brand transition-colors">
              {t('catalog')}
            </Link>
            <Link href={cartPath} className="hover:text-brand transition-colors">
              {t('cart')}
            </Link>
            <Link
              href={locale === 'nl' ? '/en' : '/nl'}
              className="border-2 border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
            >
              {t('lang')}
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </NextIntlClientProvider>
  )
}
