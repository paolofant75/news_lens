'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { Article } from '../../lib/rss'

const WorldMap = dynamic(() => import('../../components/world-map'), { ssr: false })

const GEO_LABELS: Record<string, string> = {
  europa: '🇪🇺 Europa',
  americhe: '🌎 Americhe',
  'medio-oriente': '🕌 Medio Oriente',
  asia: '🌏 Asia',
  africa: '🌍 Africa',
  oceania: '🌊 Oceania',
  mondo: '🌐 Mondo',
}

type Props = {
  articles: Article[]
  counts: Record<string, number>
}

export default function MapClient({ articles, counts }: Props) {
  const [activeArea, setActiveArea] = useState('')

  const filtered = activeArea ? articles.filter((a) => a.geo === activeArea) : articles

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">🗺️ Mappa mondiale</h1>
            <p className="text-gray-400 mt-1">
              {activeArea ? `${GEO_LABELS[activeArea]} — ${filtered.length} articoli` : `${articles.length} articoli da tutto il mondo`}
            </p>
          </div>
          {activeArea && (
            <button
              onClick={() => setActiveArea('')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
            >
              Mostra tutto ✕
            </button>
          )}
        </div>

        {/* Mappa */}
        <WorldMap counts={counts} activeArea={activeArea} onSelectArea={setActiveArea} />

        {/* Legenda */}
        <div className="flex flex-wrap gap-3 mt-4 mb-8">
          {Object.entries(counts)
            .filter(([, v]) => v > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([slug, count]) => (
              <button
                key={slug}
                onClick={() => setActiveArea(activeArea === slug ? '' : slug)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  activeArea === slug
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {GEO_LABELS[slug] ?? slug} ({count})
              </button>
            ))}
        </div>

        {/* Lista articoli filtrati */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.slice(0, 30).map((article, i) => (
            <a
              key={i}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-gray-800 bg-gray-900 p-5 hover:border-gray-600 hover:bg-gray-800 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-400">{article.source}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500">{article.category}</span>
              </div>
              <h2 className="font-semibold text-white text-sm leading-snug group-hover:text-blue-300 transition-colors line-clamp-3">
                {article.title}
              </h2>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
