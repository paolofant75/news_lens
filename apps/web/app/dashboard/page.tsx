'use client'

import { useState } from 'react'

type ServiceStatus = {
  ok: boolean
  ms: number
  message?: string
  error?: string
}

type HealthData = {
  supabase: ServiceStatus
  anthropic: ServiceStatus
  redis: ServiceStatus
  newsapi: ServiceStatus
  guardian: ServiceStatus
  nyt: ServiceStatus
}

const SERVICES = [
  { key: 'supabase',  label: 'Supabase',       desc: 'Database PostgreSQL' },
  { key: 'anthropic', label: 'Anthropic AI',    desc: 'Claude AI' },
  { key: 'redis',     label: 'Redis',           desc: 'Upstash Cache' },
  { key: 'newsapi',   label: 'NewsAPI.org',     desc: 'Notizie internazionali' },
  { key: 'guardian',  label: 'The Guardian',    desc: 'API notizie UK' },
  { key: 'nyt',       label: 'New York Times',  desc: 'API notizie USA' },
]

export default function Dashboard() {
  const [data, setData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(false)

  async function testAll() {
    setLoading(true)
    setData(null)
    try {
      const res = await fetch('/api/health')
      setData(await res.json())
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Dashboard API</h1>
          <p className="text-gray-400">Verifica lo stato delle connessioni</p>
        </div>

        <button
          onClick={testAll}
          disabled={loading}
          className="mb-10 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold transition-colors"
        >
          {loading ? 'Verifica in corso...' : 'Testa tutte le API'}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map(({ key, label, desc }) => {
            const s = data?.[key as keyof HealthData]
            return (
              <div
                key={key}
                className={`rounded-xl border p-5 transition-colors ${
                  !s
                    ? 'border-gray-800 bg-gray-900'
                    : s.ok
                    ? 'border-green-700 bg-green-950'
                    : 'border-red-700 bg-red-950'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{label}</span>
                  {s && (
                    <span className={`text-sm font-bold ${s.ok ? 'text-green-400' : 'text-red-400'}`}>
                      {s.ok ? '✓ OK' : '✗ Errore'}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-3">{desc}</p>
                {s && (
                  <div className="text-xs space-y-1">
                    <span className="text-gray-500">{s.ms}ms</span>
                    {s.message && <p className="text-gray-400">{s.message}</p>}
                    {s.error && <p className="text-red-400 truncate">{s.error}</p>}
                  </div>
                )}
                {!s && loading && <p className="text-xs text-gray-600">Verifica...</p>}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
