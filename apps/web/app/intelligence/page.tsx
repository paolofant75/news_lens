'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import IntelligenceParams from '../../components/intelligence-params'
import SourceReliabilityBadge from '../../components/source-reliability-badge'
import type { IntelligenceReport, IntelligenceParams as IParams, TimelineEvent } from '../../lib/intelligence'

const DEFAULT_PARAMS: IParams = {
  depth_level: 'deep',
  sources_required: 12,
  cross_language_analysis: true,
  fact_check_mode: 'strict',
  geopolitical_context: true,
  historical_context_years: 10,
  contradictory_views: true,
  scientific_validation: false,
  timeline_generation: true,
  disinformation_scan: true,
}

const LOADING_STEPS = [
  'Espandendo framework investigativo...',
  'Recuperando fonti globali...',
  'Attivando agenti specializzati...',
  'Analisi geopolitica in corso...',
  'Rilevando contraddizioni narrative...',
  'Scansione disinformazione...',
  'Ricostruendo timeline storica...',
  'Sintetizzando intelligence report...',
]

const RISK_COLOR: Record<string, string> = {
  low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444',
}

const SIG_COLOR: Record<string, string> = {
  minor: '#94a3b8', major: '#f59e0b', pivotal: '#ef4444',
}

function LoadingTerminal({ step }: { step: number }) {
  return (
    <div className="rounded-xl p-5 font-mono text-sm space-y-1.5" style={{ background: '#050510', border: '1px solid var(--border)' }}>
      {LOADING_STEPS.slice(0, step + 1).map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <span style={{ color: i < step ? '#22c55e' : 'var(--accent)' }}>{i < step ? '✓' : '›'}</span>
          <span style={{ color: i < step ? 'var(--text-3)' : 'var(--text)' }}>{s}</span>
          {i === step && <span className="animate-pulse" style={{ color: 'var(--accent)' }}>_</span>}
        </div>
      ))}
    </div>
  )
}

export default function IntelligencePage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [params, setParams] = useState<IParams>(DEFAULT_PARAMS)
  const [report, setReport] = useState<IntelligenceReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingStep, setLoadingStep] = useState(0)
  const [showParams, setShowParams] = useState(false)
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  async function runAnalysis(q: string) {
    if (!q.trim()) return
    setLoading(true); setError(''); setReport(null); setLoadingStep(0)

    stepTimer.current = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1))
    }, 3500)

    try {
      const res = await fetch('/api/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, ...params }),
      })
      if (!res.ok) throw new Error('Errore API')
      const data = await res.json() as IntelligenceReport
      setReport(data)
    } catch {
      setError('Errore durante l\'analisi. Riprova.')
    } finally {
      setLoading(false)
      if (stepTimer.current) clearInterval(stepTimer.current)
    }
  }

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) { setQuery(q); runAnalysis(q) }
    return () => { if (stepTimer.current) clearInterval(stepTimer.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-h)' }}>Veritas Intelligence</h1>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              INTEL
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            Pipeline multi-agente · Analisi geopolitica · Fact-checking · Timeline storica
          </p>
        </div>

        {/* Search + params */}
        <div className="mb-8 space-y-3">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runAnalysis(query)}
              placeholder="Inserisci headline, evento, keyword o domanda geopolitica..."
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none disabled:opacity-50"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            <button
              onClick={() => runAnalysis(query)}
              disabled={loading || !query.trim()}
              className="px-6 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background: 'var(--accent)', color: '#000' }}
            >
              {loading ? '...' : 'Analizza'}
            </button>
            <button
              onClick={() => setShowParams(!showParams)}
              className="px-4 py-3 rounded-xl text-sm transition-opacity hover:opacity-80"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
            >
              ⚙
            </button>
          </div>

          {showParams && (
            <IntelligenceParams params={params} onChange={setParams} disabled={loading} />
          )}
        </div>

        {/* Loading terminal */}
        {loading && <LoadingTerminal step={loadingStep} />}

        {/* Error */}
        {error && (
          <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
            {error}
          </div>
        )}

        {/* Results */}
        {report && !loading && (
          <div className="space-y-8" style={{ animation: 'intel-reveal 0.4s ease' }}>

            {/* 1. Expanded Framework */}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-3)' }}>
                Framework Investigativo
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(report.expanded_framework).filter(([, v]) => v.length > 0).map(([key, values]) => (
                  <div key={key} className="rounded-xl p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-2 opacity-50">{key.replace(/_/g, ' ')}</p>
                    {(values as string[]).map((v, i) => (
                      <p key={i} className="text-xs mb-1" style={{ color: 'var(--text-2)' }}>· {v}</p>
                    ))}
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Core article */}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>
                Articolo Consolidato Veritas
              </h2>
              <div className="rounded-xl p-6 leading-relaxed text-sm whitespace-pre-wrap"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--accent)44', color: 'var(--text)' }}>
                {report.articolo_consolidato}
              </div>
            </section>

            {/* 3. Agents grid */}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-3)' }}>
                Analisi Multi-Agente
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Geopolitical */}
                {report.geopolitical_analysis && (
                  <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644' }}>
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#3b82f6' }}>Analisi Geopolitica</p>
                    <p className="text-[10px] mb-3 opacity-60" style={{ color: 'var(--text-3)' }}>Interpretazione strutturata — non è un fatto verificato</p>
                    <p className="text-xs mb-2 font-medium" style={{ color: 'var(--text-3)' }}>Dinamiche di potere</p>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-2)' }}>{report.geopolitical_analysis.power_dynamics}</p>
                    <p className="text-xs mb-2 font-medium" style={{ color: 'var(--text-3)' }}>Implicazioni regionali</p>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-2)' }}>{report.geopolitical_analysis.regional_implications}</p>
                    {report.geopolitical_analysis.international_actors.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {report.geopolitical_analysis.international_actors.map((a, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>{a}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Economic */}
                {report.economic_intelligence && (
                  <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid #10b98144' }}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#10b981' }}>Intelligence Economica</p>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold"
                        style={{ background: RISK_COLOR[report.economic_intelligence.financial_risk_level] + '22', color: RISK_COLOR[report.economic_intelligence.financial_risk_level] }}>
                        Rischio: {report.economic_intelligence.financial_risk_level.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[10px] mb-3 opacity-60" style={{ color: 'var(--text-3)' }}>Stima basata sui dati disponibili — confidenza variabile</p>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-2)' }}>{report.economic_intelligence.market_impact}</p>
                    <div className="flex flex-wrap gap-1">
                      {report.economic_intelligence.affected_sectors.map((s, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fact verification */}
                {report.fact_verification.verified_claims.length > 0 && (
                  <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid #a855f744' }}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#a855f7' }}>Verifica Fatti</p>
                      <span className="text-[10px] font-mono" style={{ color: 'var(--text-3)' }}>Fiducia: {report.fact_verification.overall_confidence}%</span>
                    </div>
                    <p className="text-[10px] mb-3 opacity-60" style={{ color: 'var(--text-3)' }}>Basata sulle fonti disponibili — i claim non confermati sono marcati con ?</p>
                    <div className="space-y-2">
                      {report.fact_verification.verified_claims.map((c, i) => {
                        const vColor = c.verdict === 'confirmed' ? '#22c55e' : c.verdict === 'disputed' ? '#f59e0b' : '#94a3b8'
                        return (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-xs font-bold flex-shrink-0" style={{ color: vColor }}>
                              {c.verdict === 'confirmed' ? '✓' : c.verdict === 'disputed' ? '⚠' : '?'}
                            </span>
                            <div>
                              <p className="text-xs" style={{ color: 'var(--text)' }}>{c.claim}</p>
                              <p className="text-[10px] opacity-60" style={{ color: 'var(--text-3)' }}>{c.evidence}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Disinformation */}
                {report.disinformation_scan && (
                  <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: `1px solid ${RISK_COLOR[report.disinformation_scan.risk_level]}44` }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: RISK_COLOR[report.disinformation_scan.risk_level] }}>
                        Scansione Disinformazione
                      </p>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold"
                        style={{ background: RISK_COLOR[report.disinformation_scan.risk_level] + '22', color: RISK_COLOR[report.disinformation_scan.risk_level] }}>
                        {report.disinformation_scan.risk_level.toUpperCase()}
                      </span>
                    </div>
                    {report.disinformation_scan.red_flags.map((f, i) => (
                      <p key={i} className="text-xs mb-1" style={{ color: 'var(--text-2)' }}>⚑ {f}</p>
                    ))}
                    {report.disinformation_scan.propaganda_techniques.map((t, i) => (
                      <p key={i} className="text-xs mb-1" style={{ color: '#f59e0b' }}>◈ {t}</p>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 4. Timeline */}
            {report.timeline.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-3)' }}>Timeline Storica</h2>
                <div className="relative pl-6 space-y-3">
                  <div className="absolute left-2 top-0 bottom-0 w-px" style={{ background: 'var(--border)' }} />
                  {report.timeline.map((ev: TimelineEvent, i: number) => (
                    <div key={i} className="relative">
                      <span className="absolute -left-4 w-2 h-2 rounded-full border-2 top-1"
                        style={{ background: SIG_COLOR[ev.significance], borderColor: 'var(--bg)' }} />
                      <p className="text-[10px] font-mono mb-0.5" style={{ color: 'var(--text-3)' }}>{ev.date}</p>
                      <p className="text-xs" style={{ color: 'var(--text)' }}>{ev.event}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 5. Narrative conflicts */}
            {report.narrative_conflicts.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-3)' }}>Conflitti Narrativi</h2>
                <div className="space-y-3">
                  {report.narrative_conflicts.map((c, i) => (
                    <div key={i} className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg p-3" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
                        <p className="text-[9px] font-bold mb-1" style={{ color: '#3b82f6' }}>{c.source_a}</p>
                        <p className="text-xs" style={{ color: 'var(--text-2)' }}>{c.claim_a}</p>
                      </div>
                      <div className="rounded-lg p-3" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <p className="text-[9px] font-bold mb-1" style={{ color: '#ef4444' }}>{c.source_b}</p>
                        <p className="text-xs" style={{ color: 'var(--text-2)' }}>{c.claim_b}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 6. Source reliability */}
            {report.source_reliability_scores.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-3)' }}>Affidabilità Fonti</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {report.source_reliability_scores.map((s, i) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>{s.source}</p>
                      <SourceReliabilityBadge score={s} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 7. Research chains */}
            {report.research_chains.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-3)' }}>Chain di Ricerca Autonoma</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.research_chains.map((c, i) => (
                    <a
                      key={i}
                      href={`/intelligence?q=${encodeURIComponent(c.topic)}`}
                      className="rounded-xl p-4 transition-opacity hover:opacity-80 block"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                          style={{ background: 'var(--bg-s)', color: 'var(--accent)' }}>
                          {c.angle.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[9px] font-mono" style={{ color: 'var(--text-3)' }}>depth {c.depth_score}/10</span>
                      </div>
                      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{c.topic}</p>
                      <p className="text-xs" style={{ color: 'var(--text-3)' }}>{c.summary}</p>
                    </a>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
