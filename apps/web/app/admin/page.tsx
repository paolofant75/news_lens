'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '../../lib/supabase-client'
import { useAuth } from '../../components/auth-provider'

const ADMIN_EMAIL = 'fantinel.paolo@gmail.com'

type HealthEntry = { ok: boolean; ms: number; message?: string; error?: string }
type DashboardData = {
  health: {
    aiProvider: 'deepseek' | 'anthropic'
    supabase: HealthEntry
    deepseek: HealthEntry
    anthropic: HealthEntry
    redis: HealthEntry
    newsapi: HealthEntry
    guardian: HealthEntry
  }
  usage: {
    totals: {
      today: { inTok: number; outTok: number; calls: number; fails: number; cost: number }
      week:  { inTok: number; outTok: number; calls: number; fails: number; cost: number }
      month: { inTok: number; outTok: number; calls: number; fails: number; cost: number }
    } | null
    byModel: { model: string; calls: number; inTok: number; outTok: number; cost: number }[]
    byContext: { context: string; calls: number; inTok: number; outTok: number; cost: number }[]
    byDay: { day: string; calls: number; cost: number }[]
    recent: { provider: string; model: string; context: string | null; input_tokens: number; output_tokens: number; success: boolean; created_at: string }[]
    error?: string
  }
  generatedAt: string
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k'
  return String(n)
}
function fmtCost(n: number): string {
  return n < 0.01 ? `<$0.01` : `$${n.toFixed(2)}`
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = user?.email === ADMIN_EMAIL

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await getSupabaseClient().auth.getSession()
      if (!session?.access_token) {
        setError('Devi essere loggato')
        return
      }
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.error ?? `HTTP ${res.status}`)
        return
      }
      const json = (await res.json()) as DashboardData
      setData(json)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && isAdmin) fetchData()
    else if (!authLoading) setLoading(false)
  }, [authLoading, isAdmin])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--text-2)' }}>
        <p className="text-sm">Caricamento dashboard…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold mb-3">Accesso richiesto</h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>Devi effettuare l&apos;accesso con l&apos;account amministratore.</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-bold mb-3">Accesso negato</h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>Questa pagina e&apos; riservata all&apos;amministratore. Loggato come {user.email}.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="max-w-md text-center">
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>Errore: {error}</p>
          <button onClick={fetchData} className="mt-3 px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--accent)', color: '#000' }}>Riprova</button>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-h)' }}>Admin Dashboard</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
              {user.email} · Provider AI: <strong style={{ color: 'var(--accent)' }}>{data.health.aiProvider}</strong> · Aggiornato {new Date(data.generatedAt).toLocaleTimeString('it-IT')}
            </p>
          </div>
          <button onClick={fetchData} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: 'var(--accent)', color: '#000' }}>
            🔄 Aggiorna
          </button>
        </div>

        {/* HEALTH GRID */}
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Stato servizi</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(data.health).filter(([k]) => k !== 'aiProvider').map(([name, entry]) => {
              const e = entry as HealthEntry
              return (
                <div key={name} className="rounded-xl p-3" style={{ background: 'var(--bg-card)', border: `1px solid ${e.ok ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold capitalize">{name}</span>
                    <span className={`w-2 h-2 rounded-full ${e.ok ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                  <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{e.ms}ms · {(e.message ?? e.error ?? '').slice(0, 60)}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* TOTALI */}
        {data.usage.totals && (
          <section className="mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Consumo AI</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {([
                { label: 'Oggi (24h)', d: data.usage.totals.today },
                { label: 'Ultimi 7 giorni', d: data.usage.totals.week },
                { label: 'Ultimi 30 giorni', d: data.usage.totals.month },
              ] as const).map((s) => (
                <div key={s.label} className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-3)' }}>{s.label}</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{fmtCost(s.d.cost)}</p>
                  <div className="grid grid-cols-2 gap-1 mt-2 text-[11px]" style={{ color: 'var(--text-2)' }}>
                    <span>Chiamate: <strong>{s.d.calls}</strong></span>
                    <span>Falliti: <strong style={{ color: s.d.fails > 0 ? '#ef4444' : 'inherit' }}>{s.d.fails}</strong></span>
                    <span>In: <strong>{fmtNum(s.d.inTok)}</strong></span>
                    <span>Out: <strong>{fmtNum(s.d.outTok)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* BY MODEL + CONTEXT */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Per modello (30gg)</h2>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <table className="w-full text-xs">
                <thead style={{ background: 'var(--bg-card)' }}>
                  <tr><th className="text-left px-3 py-2">Modello</th><th className="text-right px-3 py-2">Chiamate</th><th className="text-right px-3 py-2">Token</th><th className="text-right px-3 py-2">Costo</th></tr>
                </thead>
                <tbody>
                  {data.usage.byModel.map((m) => (
                    <tr key={m.model} style={{ borderTop: '1px solid var(--border)' }}>
                      <td className="px-3 py-2 font-mono text-[10px]">{m.model}</td>
                      <td className="px-3 py-2 text-right">{m.calls}</td>
                      <td className="px-3 py-2 text-right">{fmtNum(m.inTok + m.outTok)}</td>
                      <td className="px-3 py-2 text-right font-semibold" style={{ color: 'var(--accent)' }}>{fmtCost(m.cost)}</td>
                    </tr>
                  ))}
                  {data.usage.byModel.length === 0 && (
                    <tr><td colSpan={4} className="px-3 py-4 text-center" style={{ color: 'var(--text-3)' }}>Nessun dato</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Per contesto (30gg)</h2>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <table className="w-full text-xs">
                <thead style={{ background: 'var(--bg-card)' }}>
                  <tr><th className="text-left px-3 py-2">Contesto</th><th className="text-right px-3 py-2">Chiamate</th><th className="text-right px-3 py-2">Token</th><th className="text-right px-3 py-2">Costo</th></tr>
                </thead>
                <tbody>
                  {data.usage.byContext.map((c) => (
                    <tr key={c.context} style={{ borderTop: '1px solid var(--border)' }}>
                      <td className="px-3 py-2">{c.context}</td>
                      <td className="px-3 py-2 text-right">{c.calls}</td>
                      <td className="px-3 py-2 text-right">{fmtNum(c.inTok + c.outTok)}</td>
                      <td className="px-3 py-2 text-right font-semibold" style={{ color: 'var(--accent)' }}>{fmtCost(c.cost)}</td>
                    </tr>
                  ))}
                  {data.usage.byContext.length === 0 && (
                    <tr><td colSpan={4} className="px-3 py-4 text-center" style={{ color: 'var(--text-3)' }}>Nessun dato</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* BAR CHART per giorno */}
        {data.usage.byDay.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Costo giornaliero (ultimi 7gg)</h2>
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {(() => {
                const maxCost = Math.max(...data.usage.byDay.map((d) => d.cost), 0.001)
                return (
                  <div className="space-y-2">
                    {data.usage.byDay.map((d) => (
                      <div key={d.day} className="flex items-center gap-3 text-xs">
                        <span className="w-20 font-mono" style={{ color: 'var(--text-3)' }}>{d.day}</span>
                        <div className="flex-1 h-5 rounded relative" style={{ background: 'var(--bg-s)' }}>
                          <div className="h-full rounded" style={{ width: `${(d.cost / maxCost) * 100}%`, background: 'var(--accent)' }} />
                          <span className="absolute right-2 top-0 h-full flex items-center font-semibold" style={{ color: 'var(--text)' }}>
                            {fmtCost(d.cost)} · {d.calls} call
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          </section>
        )}

        {/* RECENT CALLS */}
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Ultime 20 chiamate</h2>
          <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid var(--border)' }}>
            <table className="w-full text-xs min-w-[600px]">
              <thead style={{ background: 'var(--bg-card)' }}>
                <tr>
                  <th className="text-left px-3 py-2">Quando</th>
                  <th className="text-left px-3 py-2">Provider</th>
                  <th className="text-left px-3 py-2">Modello</th>
                  <th className="text-left px-3 py-2">Contesto</th>
                  <th className="text-right px-3 py-2">In</th>
                  <th className="text-right px-3 py-2">Out</th>
                  <th className="text-center px-3 py-2">OK</th>
                </tr>
              </thead>
              <tbody>
                {data.usage.recent.map((r, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="px-3 py-2 font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>{new Date(r.created_at).toLocaleTimeString('it-IT')}</td>
                    <td className="px-3 py-2">{r.provider}</td>
                    <td className="px-3 py-2 font-mono text-[10px]">{r.model}</td>
                    <td className="px-3 py-2">{r.context ?? '—'}</td>
                    <td className="px-3 py-2 text-right">{r.input_tokens}</td>
                    <td className="px-3 py-2 text-right">{r.output_tokens}</td>
                    <td className="px-3 py-2 text-center">{r.success ? '✓' : <span style={{ color: '#ef4444' }}>✗</span>}</td>
                  </tr>
                ))}
                {data.usage.recent.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-4 text-center" style={{ color: 'var(--text-3)' }}>Nessuna chiamata registrata</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  )
}
