'use client'

import { useState } from 'react'
import PageLayout from '../../components/page-layout'

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
  { key: 'supabase',  label: 'Supabase',       desc: 'Database PostgreSQL', icon: '🗄️' },
  { key: 'anthropic', label: 'Anthropic AI',    desc: 'Claude AI',           icon: '🤖' },
  { key: 'redis',     label: 'Redis',           desc: 'Upstash Cache',       icon: '⚡' },
  { key: 'newsapi',   label: 'NewsAPI.org',     desc: 'Notizie internaz.',   icon: '📰' },
  { key: 'guardian',  label: 'The Guardian',    desc: 'API notizie UK',      icon: '🇬🇧' },
  { key: 'nyt',       label: 'New York Times',  desc: 'API notizie USA',     icon: '🗽' },
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
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
            📡 API Status
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>Verifica lo stato delle connessioni</p>
        </div>

        <button
          onClick={testAll}
          disabled={loading}
          className="mb-8 px-6 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-50 transition-opacity hover:opacity-80"
          style={{ background: 'var(--accent)' }}
        >
          {loading ? 'Verifica in corso...' : 'Testa tutte le API'}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map(({ key, label, desc, icon }) => {
            const s = data?.[key as keyof HealthData]
            return (
              <div
                key={key}
                className="rounded-xl p-5 transition-all"
                style={{
                  background: !s ? 'var(--bg-card)' : s.ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${!s ? 'var(--border)' : s.ok ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 font-semibold text-sm" style={{ color: 'var(--text)' }}>
                    <span>{icon}</span>{label}
                  </span>
                  {s && (
                    <span className={`text-sm font-bold ${s.ok ? 'text-green-400' : 'text-red-400'}`}>
                      {s.ok ? '✓ OK' : '✗ Errore'}
                    </span>
                  )}
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-3)' }}>{desc}</p>
                {s && (
                  <div className="text-xs space-y-0.5" style={{ color: 'var(--text-3)' }}>
                    <span>{s.ms}ms</span>
                    {s.message && <p style={{ color: 'var(--text-2)' }} className="truncate">{s.message}</p>}
                    {s.error && <p className="text-red-400 truncate">{s.error}</p>}
                  </div>
                )}
                {!s && loading && <p className="text-xs animate-pulse" style={{ color: 'var(--text-3)' }}>Verifica...</p>}
              </div>
            )
          })}
        </div>
      </div>
    </PageLayout>
  )
}
