'use client'

import { useState, useEffect } from 'react'
import LayoutToggle from './layout-toggle'
import { encodeArticleId } from '../lib/encode'

type Article = {
  title: string
  link: string
  pubDate: string
  source: string
  summary: string
  category: string
  sourceBias: string
  sourceReliability: number
}

function timeAgoClient(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min}m fa`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h fa`
  return `${Math.floor(h / 24)}g fa`
}

export default function HomeNewsFeed({ articles }: { articles: Article[] }) {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const saved = localStorage.getItem('nlv_layout') as 'grid' | 'list' | null
    if (saved) setLayout(saved)
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
          Feed in diretta
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>{articles.length} articoli</span>
          <LayoutToggle onChange={setLayout} />
        </div>
      </div>

      {layout === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article, i) => (
            <a
              key={i}
              href={`/articolo/${encodeArticleId(article.title)}`}
              className="group p-4 rounded-xl transition-all hover:opacity-90"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>{article.source}</span>
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>{timeAgoClient(article.pubDate)}</span>
              </div>
              <h3 className="text-sm font-semibold leading-snug line-clamp-3" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
                {article.title}
              </h3>
            </a>
          ))}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {articles.map((article, i) => (
            <a
              key={i}
              href={`/articolo/${encodeArticleId(article.title)}`}
              className="flex items-center gap-4 px-5 py-3 transition-all hover:opacity-80"
              style={{
                background: 'var(--bg-card)',
                borderBottom: i < articles.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <span className="text-xs w-20 shrink-0 font-semibold truncate" style={{ color: 'var(--accent)' }}>
                {article.source}
              </span>
              <span className="flex-1 text-sm truncate" style={{ color: 'var(--text)' }}>
                {article.title}
              </span>
              <span className="text-xs shrink-0 hidden sm:block" style={{ color: 'var(--text-3)' }}>
                {timeAgoClient(article.pubDate)}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
