'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '../../lib/supabase-client'
import { useAuth } from '../../components/auth-provider'

const ADMIN_EMAIL = 'fantinel.paolo@gmail.com'

type HealthEntry = { ok: boolean; ms: number; message?: string; error?: string }
type FeedDim = { key: string; feeds: number; articles: number; healthy: number }
type FeedEntry = {
  id: string; source: string; country: string; region: string
  type: string; bias: string; reliability: number; url: string
  articlesInCache: number; healthy: boolean
  lastFetchAt: string | null
  fetchSuccess: boolean | null
  fetchDurationMs: number | null
  fetchCount: number | null
  latestPubDate: string | null
  fetchError: string | null
}
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
  feeds: {
    totalFeeds: number
    healthyFeeds: number
    failedFeeds: number
    totalArticles: number
    hasStatusSnapshot: boolean
    lastSnapshotAt: string | null
    byRegion: FeedDim[]
    byCountry: FeedDim[]
    byBias: FeedDim[]
    byType: FeedDim[]
    feeds: FeedEntry[]
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
function fmtAgo(iso: string | null): string {
  if (!iso) return '—'
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return '—'
  const diff = Date.now() - t
  if (diff < 0) return 'ora'
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s fa`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m fa`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h fa`
  return `${Math.floor(h / 24)}g fa`
}
function fmtClock(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
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

        {/* FEED RSS — Sintesi */}
        <section className="mb-10">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>Stato feed RSS</h2>
            <span className="text-[11px] font-mono" style={{ color: data.feeds.hasStatusSnapshot ? 'var(--text-3)' : '#ef4444' }}>
              {data.feeds.hasStatusSnapshot
                ? <>Ultimo fetch globale: <strong style={{ color: 'var(--text-2)' }}>{fmtAgo(data.feeds.lastSnapshotAt)}</strong> ({fmtClock(data.feeds.lastSnapshotAt)})</>
                : <>⚠ Nessuno snapshot fetch ancora registrato — la cron <code>/api/cron/refresh-feeds</code> non e&apos; mai partita o ha fallito</>
              }
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <FeedStat label="Feed configurati"      value={data.feeds.totalFeeds}    accent />
            <FeedStat label="Feed sani (>=1 art.)"  value={data.feeds.healthyFeeds}  ok />
            <FeedStat label="Feed senza articoli"   value={data.feeds.failedFeeds}   fail={data.feeds.failedFeeds > 0} />
            <FeedStat label="Articoli totali pool"  value={data.feeds.totalArticles} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeedBarChart title="Per regione" rows={data.feeds.byRegion} />
            <FeedBarChart title="Per tipo fonte" rows={data.feeds.byType} />
            <FeedBarChart title="Per bias editoriale" rows={data.feeds.byBias} />
            <FeedBarChart title="Per paese" rows={data.feeds.byCountry.slice(0, 10)} />
          </div>
        </section>

        {/* FEED RSS — Tabella dettagliata */}
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>
            Dettaglio singoli feed ({data.feeds.feeds.length})
          </h2>
          <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid var(--border)' }}>
            <table className="w-full text-xs min-w-[1100px]">
              <thead style={{ background: 'var(--bg-card)' }}>
                <tr>
                  <th className="text-center px-3 py-2 w-8">●</th>
                  <th className="text-left px-3 py-2">Fonte</th>
                  <th className="text-left px-3 py-2">Paese</th>
                  <th className="text-left px-3 py-2">Regione</th>
                  <th className="text-left px-3 py-2">Tipo</th>
                  <th className="text-left px-3 py-2">Bias</th>
                  <th className="text-right px-3 py-2">Affidabilità</th>
                  <th className="text-right px-3 py-2" title="Item restituiti dal feed prima della dedup globale">Item feed</th>
                  <th className="text-right px-3 py-2" title="Articoli nel pool corrente, post-dedup">In pool</th>
                  <th className="text-left px-3 py-2" title="Quando il fetch e' stato eseguito l'ultima volta">Ultimo fetch</th>
                  <th className="text-left px-3 py-2" title="Data pubblicazione dell'articolo piu recente arrivato da questo feed">Ultimo art.</th>
                </tr>
              </thead>
              <tbody>
                {data.feeds.feeds.map((f) => {
                  const fetchStatus = f.fetchSuccess === null
                    ? { dot: 'bg-gray-500', label: 'sconosciuto', color: 'var(--text-3)' }
                    : f.fetchSuccess
                      ? (f.fetchCount && f.fetchCount > 0
                          ? { dot: 'bg-green-500', label: 'ok', color: '#22c55e' }
                          : { dot: 'bg-yellow-500', label: 'vuoto', color: '#eab308' })
                      : { dot: 'bg-red-500', label: 'errore', color: '#ef4444' }
                  return (
                    <tr key={f.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td className="px-3 py-2 text-center" title={f.fetchError ?? fetchStatus.label}>
                        <span className={`inline-block w-2 h-2 rounded-full ${fetchStatus.dot}`} />
                      </td>
                      <td className="px-3 py-2 font-semibold">
                        {f.source}
                        {f.fetchError && (
                          <div className="text-[10px] font-normal mt-0.5 truncate max-w-[260px]" style={{ color: '#ef4444' }} title={f.fetchError}>
                            ⚠ {f.fetchError}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2" style={{ color: 'var(--text-2)' }}>{f.country}</td>
                      <td className="px-3 py-2" style={{ color: 'var(--text-2)' }}>{f.region}</td>
                      <td className="px-3 py-2 font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>{f.type}</td>
                      <td className="px-3 py-2" style={{ color: 'var(--text-2)' }}>{f.bias}</td>
                      <td className="px-3 py-2 text-right font-mono" style={{ color: f.reliability >= 8 ? '#22c55e' : f.reliability >= 6 ? '#eab308' : '#ef4444' }}>
                        {f.reliability.toFixed(1)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono" style={{ color: fetchStatus.color }}>
                        {f.fetchCount ?? '—'}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold" style={{ color: f.articlesInCache > 0 ? 'var(--accent)' : 'var(--text-3)' }}>
                        {f.articlesInCache}
                      </td>
                      <td className="px-3 py-2 font-mono text-[10px]" style={{ color: 'var(--text-2)' }} title={f.lastFetchAt ? new Date(f.lastFetchAt).toLocaleString('it-IT') : 'mai'}>
                        {fmtAgo(f.lastFetchAt)}
                        {f.fetchDurationMs !== null && <span style={{ color: 'var(--text-3)' }}> · {f.fetchDurationMs}ms</span>}
                      </td>
                      <td className="px-3 py-2 font-mono text-[10px]" style={{ color: 'var(--text-3)' }} title={f.latestPubDate ?? ''}>
                        {fmtAgo(f.latestPubDate)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
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

// ─────────────────────────────────────────────────────────────────────────────
// Componenti helper — usati nella sezione "Stato feed RSS"
// ─────────────────────────────────────────────────────────────────────────────

function FeedStat({
  label, value, accent, ok, fail,
}: { label: string; value: number; accent?: boolean; ok?: boolean; fail?: boolean }) {
  const color = fail ? '#ef4444' : ok ? '#22c55e' : accent ? 'var(--accent)' : 'var(--text)'
  const borderColor = fail
    ? 'rgba(239,68,68,0.4)'
    : ok
    ? 'rgba(34,197,94,0.4)'
    : 'var(--border)'
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: `1px solid ${borderColor}` }}>
      <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-3)' }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  )
}

function FeedBarChart({ title, rows }: { title: string; rows: FeedDim[] }) {
  const max = Math.max(...rows.map((r) => r.articles), 1)
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <p className="text-[11px] uppercase tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>{title}</p>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center gap-3 text-xs">
            <span className="w-28 truncate" style={{ color: 'var(--text-2)' }}>{r.key}</span>
            <div className="flex-1 h-5 rounded relative overflow-hidden" style={{ background: 'var(--bg-s)' }}>
              <div className="h-full" style={{ width: `${(r.articles / max) * 100}%`, background: 'var(--accent)' }} />
              <span className="absolute right-2 top-0 h-full flex items-center font-semibold text-[10px]" style={{ color: 'var(--text)' }}>
                {r.articles} art · {r.healthy}/{r.feeds} feed
              </span>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-center text-xs py-2" style={{ color: 'var(--text-3)' }}>Nessun dato</p>
        )}
      </div>
    </div>
  )
}
