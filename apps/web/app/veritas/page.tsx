'use client'

import { useState } from 'react'
import type { VeritasResult } from '../../lib/veritas'

function BiasBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full rounded-full h-1.5" style={{ background: 'var(--bg-s)' }}>
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  )
}

function biasColor(val: number) {
  if (val <= 20) return 'bg-green-500'
  if (val <= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

function badgeStyle(tipo: string) {
  if (tipo === 'neutro') return { background: 'rgba(34,197,94,0.15)', color: '#22c55e' }
  if (tipo === 'politico' || tipo === 'sensazionalistico') return { background: 'rgba(239,68,68,0.15)', color: '#ef4444' }
  return { background: 'rgba(234,179,8,0.15)', color: '#eab308' }
}

export default function VeritasPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VeritasResult | null>(null)
  const [error, setError] = useState('')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setResult(null)
    setError('')
    try {
      const res = await fetch(`/api/veritas?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Errore')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
            ⚖️ Veritas
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Cerca una notizia o incolla un URL — Claude analizza tutte le fonti e rileva i bias
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Es: guerra ucraina  |  https://www.bbc.com/news/..."
            className="flex-1 px-5 py-3 rounded-xl text-sm focus:outline-none transition-colors"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 transition-opacity hover:opacity-80 text-white"
            style={{ background: 'var(--accent)' }}
          >
            {loading ? 'Analisi...' : 'Analizza'}
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 animate-pulse">⚖️</div>
            <p style={{ color: 'var(--text-2)' }}>Claude sta analizzando le fonti...</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>~15-20 secondi</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-8">
            {/* Articolo consolidato */}
            <div className="rounded-2xl p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--accent)', borderOpacity: 0.4 }}>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">📰</span>
                <div>
                  <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-h)', color: 'var(--accent)' }}>
                    Articolo Consolidato — Veritas
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                    Sintesi imparziale · {result.sources.length} fonti
                  </p>
                </div>
              </div>
              <div className="leading-relaxed whitespace-pre-wrap text-sm" style={{ color: 'var(--text)' }}>
                {result.articolo_consolidato}
              </div>
            </div>

            {/* Fonti */}
            <div>
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
                Analisi delle fonti ({result.sources.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.sources.map((src, i) => {
                  const analisi = result.analisi.find((a) => a.indice === i + 1 || a.fonte === src.source)
                  if (!analisi || analisi.tipo_bias === 'non pertinente' || analisi.completezza === 0) return null
                  return (
                    <div key={i} className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{src.source}</span>
                        <a href={src.link} target="_blank" rel="noopener noreferrer" className="text-xs transition-opacity hover:opacity-70" style={{ color: 'var(--accent)' }}>Apri ↗</a>
                      </div>
                      <p className="text-xs mb-4 line-clamp-2" style={{ color: 'var(--text-2)' }}>{src.title}</p>
                      <div className="space-y-2 mb-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: 'var(--text-3)' }}>Completezza</span>
                            <span className="font-medium text-green-400">{analisi.completezza}%</span>
                          </div>
                          <BiasBar value={analisi.completezza} color="bg-green-500" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: 'var(--text-3)' }}>Bias</span>
                            <span className={`font-medium ${analisi.bias <= 20 ? 'text-green-400' : analisi.bias <= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{analisi.bias}%</span>
                          </div>
                          <BiasBar value={analisi.bias} color={biasColor(analisi.bias)} />
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap" style={badgeStyle(analisi.tipo_bias)}>{analisi.tipo_bias}</span>
                        <p className="text-xs leading-snug" style={{ color: 'var(--text-3)' }}>{analisi.nota}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
