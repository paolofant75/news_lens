'use client'

import { useState, useMemo } from 'react'
import { COUNTRIES, REGION_LABELS } from '../lib/countries'
import { encodeArticleId } from '../lib/encode'

type Article = { title: string; link: string; pubDate: string; source: string; summary: string; category: string }

export default function CountryPanel() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [articles, setArticles] = useState<Article[]>([])
  const [countryName, setCountryName] = useState('')

  const filtered = useMemo(() =>
    COUNTRIES.filter((c) =>
      c.nameIt.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
    ), [search])

  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {}
    for (const c of filtered) {
      if (!map[c.region]) map[c.region] = []
      map[c.region].push(c)
    }
    return map
  }, [filtered])

  async function selectCountry(code: string) {
    setSelected(code)
    setLoading(true)
    setArticles([])
    try {
      const res = await fetch(`/api/country-news?code=${code}`)
      const data = await res.json()
      setArticles(data.articles ?? [])
      setCountryName(data.country ?? code)
    } catch {
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-opacity hover:opacity-80 mt-1"
        style={{ color: 'var(--accent)', border: '1px solid var(--border)', background: 'var(--bg-card)' }}
      >
        🌐 Cerca per paese
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div
            className="relative ml-auto w-full max-w-2xl h-full flex flex-col shadow-2xl"
            style={{ background: 'var(--bg)', borderLeft: '1px solid var(--border)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
                🌐 Notizie per paese
              </h2>
              <button onClick={() => setOpen(false)} className="text-xl hover:opacity-60" style={{ color: 'var(--text-3)' }}>✕</button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Lista paesi */}
              <div className="w-56 flex flex-col overflow-hidden" style={{ borderRight: '1px solid var(--border)' }}>
                <div className="p-3">
                  <input
                    type="text"
                    placeholder="Cerca paese..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  />
                </div>
                <div className="flex-1 overflow-y-auto px-2 pb-4">
                  {Object.entries(grouped).map(([region, countries]) => (
                    <div key={region} className="mb-3">
                      <p className="text-xs font-semibold uppercase tracking-widest px-2 py-1" style={{ color: 'var(--text-3)' }}>
                        {REGION_LABELS[region] ?? region}
                      </p>
                      {countries.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => selectCountry(c.code)}
                          className="w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-80"
                          style={selected === c.code
                            ? { background: 'var(--accent)', color: '#fff' }
                            : { color: 'var(--text-2)' }}
                        >
                          {c.nameIt}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Articoli */}
              <div className="flex-1 overflow-y-auto p-5">
                {!selected && (
                  <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-3)' }}>
                    <div className="text-center">
                      <div className="text-4xl mb-3">🌍</div>
                      <p className="text-sm">Seleziona un paese per vedere le notizie</p>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="flex items-center justify-center h-full animate-pulse" style={{ color: 'var(--text-3)' }}>
                    <div className="text-center">
                      <div className="text-3xl mb-2">🔍</div>
                      <p className="text-sm">Ricerca notizie per {countryName || '...'}...</p>
                    </div>
                  </div>
                )}

                {!loading && selected && articles.length === 0 && (
                  <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-3)' }}>
                    <p className="text-sm">Nessuna notizia trovata</p>
                  </div>
                )}

                {!loading && articles.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
                      {countryName} — {articles.length} articoli
                    </p>
                    <div className="space-y-3">
                      {articles.map((a, i) => (
                        <div key={i} className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>{a.source}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-s)', color: 'var(--text-3)' }}>{a.category}</span>
                          </div>
                          <p className="text-sm font-semibold mb-2 leading-snug" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
                            {a.title}
                          </p>
                          {a.summary && (
                            <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-2)' }}>{a.summary}</p>
                          )}
                          <div className="flex gap-3">
                            <a
                              href={`/articolo/${encodeArticleId(a.title)}`}
                              className="text-xs transition-opacity hover:opacity-70"
                              style={{ color: 'var(--accent)' }}
                            >
                              ⚖️ Veritas
                            </a>
                            <a
                              href={a.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs transition-opacity hover:opacity-70"
                              style={{ color: 'var(--text-3)' }}
                            >
                              Apri ↗
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
