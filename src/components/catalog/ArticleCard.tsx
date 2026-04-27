import Link from 'next/link'
import type { Article } from '@/lib/supabase/types'

interface ArticleCardProps {
  article: Article
  locale: string
  catalogPath: string
}

export function ArticleCard({ article, locale, catalogPath }: ArticleCardProps) {
  const name = locale === 'nl' ? article.name_nl : article.name_en
  return (
    <Link
      href={`${catalogPath}/${article.id}`}
      className="group border-2 border-black hover:border-brand transition-colors"
    >
      <div className="aspect-square bg-gray-100 overflow-hidden">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
            📦
          </div>
        )}
      </div>
      <div className="p-4 border-t-2 border-black">
        <p className="font-black text-sm uppercase tracking-wide">{name}</p>
        <p className="text-brand font-black text-lg mt-1">
          €{article.price_per_day}
          <span className="text-gray-500 font-normal text-sm"> / dag</span>
        </p>
      </div>
    </Link>
  )
}
