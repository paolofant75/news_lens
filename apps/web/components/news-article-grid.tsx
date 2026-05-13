'use client'

import { useState, useEffect } from 'react'
import LayoutToggle from './layout-toggle'
import { getSupabaseClient } from '../lib/supabase-client'
import SourceReliabilityBadge from './source-reliability-badge'

async function trackRead(article: { title: string; link: string; category: string; geo: string; source: string }) {
  try {
    const { data: { session } } = await getSupabaseClient().auth.getSession()
    if (!session?.access_token) return
    fetch('/api/user/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(article),
    })
  } catch { /* ignore */ }
}

type Article = {
  title: string
  originalTitle?: string
  link: string
  pubDate: string
  source: string
  summary: string
  category: string
  geo: string
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

function encodeId(title: string): string {
  try {
    const bytes = new TextEncoder().encode(title)
    const binary = Array.from(bytes).map((b) => String.fromCharCode(b)).join('')
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  } catch {
    return btoa(title).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }
}

const BIAS_COLOR: Record<string, string> = {
  'center': 'text-green-400', 'center-left': 'text-blue-400',
  'center-right': 'text-orange-400', 'state-aligned': 'text-red-400',
  'mixed': 'text-yellow-400', 'unknown': '',
}

export default function NewsArticleGrid({
  articles, count, sourceCount
}: {
  articles: Article[]
  count: number
  sourceCount: number
}) {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const saved = localStorage.getItem('nlv_layout') as 'grid' | 'list' | null
    if (saved) setLayout(saved)
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>
          {count} articoli · {sourceCount} fonti
        </p>
        <LayoutToggle onChange={setLayout} />
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--text-3)' }}>
          Nessun articolo trovato.
        </div>
      ) : layout === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {articles.map((article, i) => {
            const id = encodeId(article.originalTitle ?? article.title)
            return (
              <div key={i} className="group rounded-xl overflow-hidden transition-all hover:opacity-90"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <a href={`/articolo/${id}`} className="block p-5"
                onClick={() => trackRead({ title: article.originalTitle ?? article.title, link: article.link, category: article.category, geo: article.geo, source: article.source })}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>{article.source}</span>
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>{timeAgoClient(article.pubDate)}</span>
                  </div>
                  <h2 className="font-semibold mb-2 leading-snug line-clamp-3" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
                    {article.title}
                  </h2>
                  {article.summary && (
                    <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--text-2)' }}>{article.summary}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-s)', color: 'var(--text-3)' }}>{article.category}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-s)', color: 'var(--text-3)' }}>{article.geo}</span>
                    <SourceReliabilityBadge reliability={article.sourceReliability} bias={article.sourceBias} compact />
                  </div>
                </a>
                <div className="px-5 pb-4 flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <a href={`/articolo/${id}`} className="text-xs transition-opacity hover:opacity-70" style={{ color: 'var(--accent)' }}>
                    ⚖️ Veritas
                  </a>
                  <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-xs transition-opacity hover:opacity-70" style={{ color: 'var(--text-3)' }}>
                    Originale ↗
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {articles.map((article, i) => {
            const id = encodeId(article.originalTitle ?? article.title)
            return (
              <a key={i} href={`/articolo/${id}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-all hover:opacity-80 group"
                style={{ background: 'var(--bg-card)', borderBottom: i < articles.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <span className="text-xs w-24 shrink-0 font-semibold truncate" style={{ color: 'var(--accent)' }}>{article.source}</span>
                <span className="flex-1 text-sm truncate group-hover:underline" style={{ color: 'var(--text)' }}>{article.title}</span>
                <span className="text-xs shrink-0 hidden sm:block px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-s)', color: 'var(--text-3)' }}>{article.category}</span>
                <span className="text-xs shrink-0" style={{ color: 'var(--text-3)' }}>{timeAgoClient(article.pubDate)}</span>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
