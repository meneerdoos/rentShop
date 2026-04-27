import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Article, Category } from '@/lib/supabase/types'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('home')
  const supabase = createServerSupabaseClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  const { data: featured } = await supabase
    .from('articles')
    .select('*')
    .eq('active', true)
    .limit(4)

  const catalogPath = locale === 'nl' ? `/${locale}/verhuur` : `/${locale}/rental`

  return (
    <div>
      {/* Hero */}
      <section className="bg-black text-white py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black leading-none mb-8">
            {t('hero')}
          </h1>
          <Link
            href={catalogPath}
            className="inline-block bg-brand text-white font-black uppercase tracking-widest px-8 py-4 hover:bg-brand-hover transition-colors"
          >
            {t('heroCta')} →
          </Link>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(categories as Category[]).map(cat => (
              <Link
                key={cat.id}
                href={`${catalogPath}?category=${cat.slug}`}
                className="border-4 border-black p-6 font-black text-lg uppercase hover:bg-black hover:text-white transition-colors"
              >
                {locale === 'nl' ? cat.name_nl : cat.name_en}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-black text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-12">{t('howTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {([t('step1'), t('step2'), t('step3')] as string[]).map((step, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="text-brand text-5xl font-black leading-none">{i + 1}</span>
                <p className="text-xl font-black">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured articles */}
      {featured && featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(featured as Article[]).map(article => (
              <Link
                key={article.id}
                href={`${catalogPath}/${article.id}`}
                className="border-2 border-black hover:border-brand transition-colors"
              >
                {article.image_url && (
                  <img src={article.image_url} alt="" className="w-full aspect-square object-cover" />
                )}
                <div className="p-4">
                  <p className="font-black text-sm">{locale === 'nl' ? article.name_nl : article.name_en}</p>
                  <p className="text-brand font-black">€{article.price_per_day} / dag</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
