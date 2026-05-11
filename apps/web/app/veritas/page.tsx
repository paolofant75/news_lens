'use client'

import { useState } from 'react'
import type { VeritasResult } from '../../lib/veritas'

function BiasBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full bg-gray-800 rounded-full h-2">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  )
}

function biasColor(val: number) {
  if (val <= 20) return 'bg-green-500'
  if (val <= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

function biasLabel(tipo: string) {
  const map: Record<string, string> = {
    neutro: '✓ Neutro',
    politico: '⚠ Politico',
    sensazionalistico: '⚠ Sensazionalistico',
    omissivo: '⚠ Omissivo',
    parziale: '⚠ Parziale',
  }
  return map[tipo] ?? tipo
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
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">🔍 Veritas</h1>
          <p className="text-gray-400">Cerca una notizia o incolla un URL — Claude analizza tutte le fonti e rileva i bias</p>
        </div>

        {/* Search box */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-12">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Es: guerra ucraina  |  https://www.bbc.com/news/..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl font-semibold transition-colors whitespace-nowrap"
          >
            {loading ? 'Analisi...' : 'Analizza'}
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 animate-pulse">⚖️</div>
            <p className="text-gray-400">Claude sta analizzando le fonti...</p>
            <p className="text-gray-600 text-sm mt-1">Ci vogliono circa 15-20 secondi</p>
          </div>
        )}

        {/* Errore */}
        {error && (
          <div className="bg-red-950 border border-red-800 rounded-xl p-5 text-red-300 text-center">
            {error}
          </div>
        )}

        {/* Risultati */}
        {result && (
          <div className="space-y-10">

            {/* Articolo consolidato */}
            <div className="rounded-2xl border border-blue-800 bg-blue-950/30 p-8">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">📰</span>
                <div>
                  <h2 className="text-xl font-bold text-blue-300">Articolo Consolidato — Veritas</h2>
                  <p className="text-sm text-blue-500">Sintesi imparziale basata su {result.sources.length} fonti</p>
                </div>
              </div>
              <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                {result.articolo_consolidato}
              </div>
            </div>

            {/* Analisi fonti */}
            <div>
              <h2 className="text-xl font-bold mb-5 text-gray-200">
                Analisi delle fonti ({result.sources.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.sources.map((src, i) => {
                  const analisi = result.analisi.find((a) => a.indice === i + 1 || a.fonte === src.source)
                  return (
                    <div key={i} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                      {/* Testata + link */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-white">{src.source}</span>
                        <a
                          href={src.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:underline"
                        >
                          Apri ↗
                        </a>
                      </div>

                      {/* Titolo */}
                      <p className="text-sm text-gray-300 mb-4 line-clamp-2">{src.title}</p>

                      {analisi ? (
                        <>
                          {/* Completezza */}
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Completezza</span>
                              <span className="font-semibold text-green-400">{analisi.completezza}%</span>
                            </div>
                            <BiasBar value={analisi.completezza} color="bg-green-500" />
                          </div>

                          {/* Bias */}
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Bias</span>
                              <span className={`font-semibold ${analisi.bias <= 20 ? 'text-green-400' : analisi.bias <= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {analisi.bias}%
                              </span>
                            </div>
                            <BiasBar value={analisi.bias} color={biasColor(analisi.bias)} />
                          </div>

                          {/* Tipo bias + nota */}
                          <div className="flex items-start justify-between gap-2 mt-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              analisi.tipo_bias === 'neutro'
                                ? 'bg-green-900 text-green-300'
                                : 'bg-yellow-900 text-yellow-300'
                            }`}>
                              {biasLabel(analisi.tipo_bias)}
                            </span>
                            <p className="text-xs text-gray-500 text-right flex-1">{analisi.nota}</p>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-gray-600">Analisi non disponibile</p>
                      )}
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
