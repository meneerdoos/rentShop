'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Article } from '@/lib/supabase/types'

interface ArticleCardProps {
  article: Article
  locale: string
  catalogPath: string
}

export function ArticleCard({ article, locale, catalogPath }: ArticleCardProps) {
  const [hovered, setHovered] = useState(false)
  const name = locale === 'nl' ? article.name_nl : article.name_en

  return (
    <Link
      href={`${catalogPath}/${article.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 2,
        overflow: 'hidden',
        textDecoration: 'none',
        transition: 'transform 0.22s, box-shadow 0.22s',
        transform: hovered ? 'translateY(-5px)' : 'none',
        boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.12)' : 'none',
      }}
    >
      <div style={{ height: 220, position: 'relative', background: 'var(--bg-subtle)' }}>
        {article.image_url
          ? <img src={article.image_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'monospace', fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', padding: '0 16px' }}>
              {name}
            </div>
          )
        }
      </div>
      <div style={{ padding: '16px 18px 20px' }}>
        <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
          {locale === 'nl' ? 'Verhuur' : 'Rental'}
        </p>
        <h3 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 21, fontWeight: 500, color: 'var(--text)', marginBottom: 8, lineHeight: 1.2 }}>
          {name}
        </h3>
        <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 13, color: 'var(--text-muted)' }}>
          {locale === 'nl' ? 'Vanaf ' : 'From '}
          <strong style={{ color: 'var(--text)', fontWeight: 500 }}>€{article.price_per_day}</strong>
          {locale === 'nl' ? ' / dag' : ' / day'}
        </p>
      </div>
    </Link>
  )
}
