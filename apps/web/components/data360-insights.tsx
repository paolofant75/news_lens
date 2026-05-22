'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  IconSwords, IconTrending, IconLeaf, IconGlobe, IconHospital, IconSatellite,
  IconCoins, IconBook, IconZap, IconVote, IconBarChart, IconLink as IconLinkSvg,
  IconScale, IconClose, IconSearch,
} from './icons'

type IconComp = (p: { size?: number; className?: string }) => React.ReactElement

type Indicator = { idno: string; name: string; database_id: string }
type DataPoint  = { TIME_PERIOD: string; OBS_VALUE: string }

const TOPICS: { label: string; Icon: IconComp; q: string }[] = [
  { label: 'Spesa militare',  Icon: IconSwords,    q: 'military expenditure defense arms' },
  { label: 'Inflazione',      Icon: IconTrending,  q: 'inflation consumer prices CPI' },
  { label: 'Clima & CO₂',     Icon: IconLeaf,      q: 'climate emissions carbon dioxide temperature' },
  { label: 'Rifugiati',       Icon: IconGlobe,     q: 'refugees displacement migration asylum' },
  { label: 'Sanità',          Icon: IconHospital,  q: 'health mortality disease hospital' },
  { label: 'Tecnologia',      Icon: IconSatellite, q: 'technology internet innovation digital patents' },
  { label: 'Povertà',         Icon: IconCoins,     q: 'poverty inequality income wages' },
  { label: 'Istruzione',      Icon: IconBook,      q: 'education literacy school enrollment' },
  { label: 'Energia',         Icon: IconZap,       q: 'energy renewable electricity access' },
  { label: 'Democrazia',      Icon: IconVote,      q: 'democracy governance corruption rule of law' },
]

const CAPABILITIES: { Icon: IconComp; title: string; desc: string }[] = [
  { Icon: IconBarChart,  title: 'Timeline Storica',   desc: '50+ anni di dati per ogni indicatore. Visualizza trend e punti di svolta storici.' },
  { Icon: IconLinkSvg,   title: 'Multi-Indicatore',   desc: 'Confronta metriche su 200+ paesi. Dal PIL alla mortalità, tutto in un workspace.' },
  { Icon: IconScale,     title: 'Contesto Veritas',   desc: 'Ogni indicatore è collegabile all\'analisi AI di Veritas per il contesto narrativo.' },
]

export default function Data360Insights() {
  const [query,       setQuery]       = useState('')
  const [searching,   setSearching]   = useState(false)
  const [results,     setResults]     = useState<Indicator[]>([])
  const [selected,    setSelected]    = useState<Indicator | null>(null)
  const [series,      setSeries]      = useState<DataPoint[]>([])
  const [loadingSeries, setLoadingSeries] = useState(false)
  const [open,        setOpen]        = useState(false)
  const [err,         setErr]         = useState('')

  const inputRef   = useRef<HTMLInputElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [close])

  const search = async (q: string) => {
    const t = q.trim()
    if (!t) return
    setQuery(t)
    setSearching(true)
    setErr('')
    setResults([])
    setSelected(null)
    setSeries([])
    setOpen(true)
    try {
      const res  = await fetch('/api/data360/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: t }),
      })
      const data = await res.json()
      const list: Indicator[] = (data.value ?? [])
        .map((item: Record<string, unknown>) => {
          const d = item.series_description as Record<string, string>
          return { idno: d?.idno ?? '', name: d?.name ?? '', database_id: d?.database_id ?? '' }
        })
        .filter((i: Indicator) => i.idno && i.name)
      setResults(list)
      if (list.length > 0) selectIndicator(list[0])
    } catch {
      setErr('Connessione a Data360 non riuscita. Riprova tra qualche istante.')
    } finally {
      setSearching(false)
    }
  }

  const selectIndicator = async (ind: Indicator) => {
    setSelected(ind)
    setLoadingSeries(true)
    setSeries([])
    try {
      const res  = await fetch(
        `/api/data360/indicator?indicator=${encodeURIComponent(ind.idno)}&database=${encodeURIComponent(ind.database_id)}`
      )
      const data = await res.json()
      const pts: DataPoint[] = (data.value ?? [])
        .filter((d: Record<string, string>) => d.OBS_VALUE && d.REF_AREA === 'WLD')
        .sort((a: DataPoint, b: DataPoint) => a.TIME_PERIOD.localeCompare(b.TIME_PERIOD))
        .slice(-22)
      setSeries(pts)
    } catch { /* silent */ }
    finally { setLoadingSeries(false) }
  }

  const latest = series[series.length - 1]
  const maxVal = Math.max(...series.map(d => parseFloat(d.OBS_VALUE) || 0), 1)

  return (
    <>
      {/* ─── SECTION ──────────────────────────────────────────── */}
      <div
        className="mt-12 rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border)' }}
      >
        {/* Header bar */}
        <div
          className="flex items-center justify-between px-6 py-3"
          style={{ background: 'var(--bg-s)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--accent)', animation: 'beacon-pulse 2s ease infinite' }}
            />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
              Data360 Intelligence
            </span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-bold"
              style={{ background: 'var(--accent)1a', color: 'var(--accent)', border: '1px solid var(--accent)44' }}
            >
              BETA
            </span>
          </div>
          <span className="text-[10px] hidden md:block" style={{ color: 'var(--text-3)' }}>
            World Bank Data360 · 10.000+ indicatori · 200+ paesi · 50 anni di storia
          </span>
        </div>

        <div className="p-6" style={{ background: 'var(--bg-card)' }}>
          {/* Search input */}
          <div className="flex gap-2 mb-5">
            <div
              className="flex-1 flex items-center gap-3 rounded-xl px-4"
              style={{ background: 'var(--bg-s)', border: '1px solid var(--border)' }}
            >
              <IconSearch size={14} className="shrink-0 opacity-70" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search(query)}
                placeholder="Cerca qualsiasi indicatore: PIL, mortalità, emissioni, rifugiati, spesa militare…"
                className="d360-input flex-1 bg-transparent py-3.5 text-sm outline-none"
                style={{ color: 'var(--text)' }}
              />
            </div>
            <button
              onClick={() => search(query)}
              disabled={!query.trim()}
              className="px-5 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-80 disabled:opacity-30 shrink-0"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Cerca →
            </button>
          </div>

          {/* Topic chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs self-center shrink-0 mr-1" style={{ color: 'var(--text-3)' }}>
              Esplora:
            </span>
            {TOPICS.map(t => (
              <button
                key={t.q}
                onClick={() => search(t.q)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-80 active:scale-95"
                style={{ background: 'var(--bg-s)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
              >
                <t.Icon size={12} className="opacity-80" />{t.label}
              </button>
            ))}
          </div>

          {/* Capability cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {CAPABILITIES.map(c => (
              <div
                key={c.title}
                className="rounded-xl p-4 cursor-default"
                style={{ background: 'var(--bg-s)', border: '1px solid var(--border)' }}
              >
                <div className="mb-2" style={{ color: 'var(--text-2)' }}><c.Icon size={20} /></div>
                <p className="text-xs font-bold mb-1" style={{ color: 'var(--text)' }}>{c.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── WORKSPACE OVERLAY ─────────────────────────────────── */}
      {open && (
        <div
          ref={backdropRef}
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 200, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', animation: 'd360-fade 0.2s ease' }}
          onClick={e => { if (e.target === backdropRef.current) close() }}
        >
          <div
            className="flex flex-col rounded-2xl overflow-hidden w-full"
            style={{
              maxWidth: 1200,
              height: '88vh',
              background: 'var(--bg-s)',
              border: '1px solid var(--border)',
              animation: 'd360-up 0.25s ease',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* ── Overlay header */}
            <div
              className="flex items-center justify-between px-6 py-4 shrink-0 gap-4"
              style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: 'var(--accent)', animation: 'beacon-pulse 2s ease infinite' }}
                />
                <span className="text-xs font-bold uppercase tracking-widest shrink-0" style={{ color: 'var(--text-3)' }}>
                  Data360
                </span>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg min-w-0"
                  style={{ background: 'var(--bg-s)', border: '1px solid var(--border)' }}
                >
                  <IconSearch size={12} className="shrink-0 opacity-70" />
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{query}</span>
                </div>
                {!searching && results.length > 0 && (
                  <span className="text-xs shrink-0 hidden sm:block" style={{ color: 'var(--text-3)' }}>
                    {results.length} indicatori
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => { close(); setTimeout(() => { setOpen(false); inputRef.current?.focus() }, 50) }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80 hidden sm:flex"
                  style={{ background: 'var(--bg-s)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                >
                  <IconSearch size={12} /> Nuova ricerca
                </button>
                <button
                  onClick={close}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-opacity hover:opacity-70"
                  style={{ background: 'var(--bg-s)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                  aria-label="Chiudi"
                >
                  <IconClose size={14} />
                </button>
              </div>
            </div>

            {/* ── Overlay body */}
            <div className="flex flex-1 min-h-0">

              {/* Left panel — results list */}
              <div
                className="w-64 md:w-72 shrink-0 flex flex-col overflow-y-auto"
                style={{ borderRight: '1px solid var(--border)' }}
              >
                {searching ? (
                  <div className="flex flex-col items-center justify-center flex-1 gap-3 p-6">
                    <div
                      className="w-7 h-7 rounded-full border-2 animate-spin"
                      style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
                    />
                    <span className="text-xs text-center" style={{ color: 'var(--text-3)' }}>
                      Interrogo Data360<br/>World Bank…
                    </span>
                  </div>
                ) : err ? (
                  <div className="p-5">
                    <p className="text-xs leading-relaxed" style={{ color: '#ef4444' }}>{err}</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-5 text-center">
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>Nessun risultato trovato.</p>
                  </div>
                ) : (
                  <div className="p-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest px-3 py-2" style={{ color: 'var(--text-3)' }}>
                      Indicatori ({results.length})
                    </p>
                    {results.map((ind, i) => {
                      const isActive = selected?.idno === ind.idno
                      return (
                        <button
                          key={ind.idno}
                          onClick={() => selectIndicator(ind)}
                          className="w-full text-left px-3 py-2.5 rounded-lg mb-0.5 transition-all"
                          style={{
                            background: isActive ? 'var(--accent)18' : 'transparent',
                            border: `1px solid ${isActive ? 'var(--accent)55' : 'transparent'}`,
                            animation: `intel-reveal 0.3s ease ${i * 0.03}s both`,
                          }}
                        >
                          <p
                            className="text-xs font-medium leading-snug line-clamp-2"
                            style={{ color: isActive ? 'var(--accent)' : 'var(--text)' }}
                          >
                            {ind.name}
                          </p>
                          <p className="text-[10px] mt-0.5 font-mono opacity-60" style={{ color: 'var(--text-3)' }}>
                            {ind.database_id}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Right panel — detail */}
              <div className="flex-1 overflow-y-auto p-6">
                {!selected && !searching ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-sm" style={{ color: 'var(--text-3)' }}>
                      Seleziona un indicatore dalla lista
                    </p>
                  </div>
                ) : selected && (
                  <div style={{ animation: 'intel-reveal 0.2s ease' }}>

                    {/* Indicator title */}
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono mb-1 opacity-50" style={{ color: 'var(--text-3)' }}>
                          {selected.idno}
                        </p>
                        <h2
                          className="text-xl md:text-2xl font-bold leading-tight"
                          style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}
                        >
                          {selected.name}
                        </h2>
                      </div>
                      <Link
                        href={`/veritas?q=${encodeURIComponent(selected.name)}`}
                        onClick={close}
                        className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-opacity hover:opacity-80 whitespace-nowrap"
                        style={{ background: 'var(--accent)', color: '#fff' }}
                      >
                        <IconScale size={12} /> Analizza su Veritas
                      </Link>
                    </div>

                    {/* Latest value card */}
                    {loadingSeries ? (
                      <div className="flex items-center gap-3 mb-6">
                        <div
                          className="w-5 h-5 rounded-full border-2 animate-spin shrink-0"
                          style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
                        />
                        <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                          Carico serie storica…
                        </span>
                      </div>
                    ) : latest ? (
                      <div
                        className="grid grid-cols-3 gap-4 p-5 rounded-2xl mb-6"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                      >
                        <div>
                          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-3)' }}>
                            Ultimo valore · {latest.TIME_PERIOD}
                          </p>
                          <p
                            className="text-3xl md:text-4xl font-bold tabular-nums"
                            style={{ fontFamily: 'var(--font-h)', color: 'var(--accent)' }}
                          >
                            {parseFloat(latest.OBS_VALUE).toLocaleString('it-IT', { maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-3)' }}>
                            Copertura storica
                          </p>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                            {series[0]?.TIME_PERIOD} → {latest.TIME_PERIOD}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                            {series.length} rilevazioni
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-3)' }}>
                            Fonte / Area
                          </p>
                          <p className="text-sm font-semibold font-mono" style={{ color: 'var(--text)' }}>
                            {selected.database_id}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>WLD · Globale</p>
                        </div>
                      </div>
                    ) : !loadingSeries && series.length === 0 ? (
                      <div
                        className="p-4 rounded-xl mb-6"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                      >
                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                          Dati aggregati globali (WLD) non disponibili per questo indicatore.
                          Potrebbe richiedere filtri per paese specifico.
                        </p>
                      </div>
                    ) : null}

                    {/* Timeline bar chart */}
                    {series.length > 1 && !loadingSeries && (
                      <div className="mb-8">
                        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-3)' }}>
                          Andamento storico · {series[0].TIME_PERIOD} → {series[series.length - 1].TIME_PERIOD}
                        </p>
                        <div className="flex items-end gap-1" style={{ height: 140 }}>
                          {series.map((d, i) => {
                            const val = parseFloat(d.OBS_VALUE) || 0
                            const pct = Math.max((val / maxVal) * 100, 2)
                            const isLast = i === series.length - 1
                            return (
                              <div key={d.TIME_PERIOD} className="flex-1 flex flex-col items-center group relative">
                                <div
                                  className="w-full rounded-sm transition-all"
                                  style={{
                                    height: `${pct}%`,
                                    background: isLast ? 'var(--accent)' : 'var(--accent)50',
                                    animation: `counter-roll 0.5s ease ${i * 0.025}s both`,
                                  }}
                                />
                                <div
                                  className="absolute bottom-full mb-1 px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                                  style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text)',
                                    zIndex: 10,
                                  }}
                                >
                                  {d.TIME_PERIOD}: {parseFloat(d.OBS_VALUE).toFixed(2)}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-[10px] font-mono" style={{ color: 'var(--text-3)' }}>
                            {series[0].TIME_PERIOD}
                          </span>
                          <span className="text-[10px] font-mono" style={{ color: 'var(--accent)' }}>
                            {series[series.length - 1].TIME_PERIOD} ◀ ultimo
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Related indicators */}
                    {results.filter(r => r.idno !== selected.idno).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>
                          Indicatori correlati dalla stessa ricerca
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {results.filter(r => r.idno !== selected.idno).slice(0, 8).map(ind => (
                            <button
                              key={ind.idno}
                              onClick={() => selectIndicator(ind)}
                              className="px-3 py-1.5 rounded-full text-xs transition-all hover:opacity-80 text-left"
                              style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-2)',
                              }}
                            >
                              {ind.name.length > 55 ? ind.name.slice(0, 55) + '…' : ind.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Overlay footer */}
            <div
              className="flex items-center justify-between px-6 py-2.5 shrink-0"
              style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}
            >
              <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>
                Powered by World Bank Data360 API · Licenza CC BY 4.0
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>
                ESC per chiudere
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Scoped animations + placeholder */}
      <style>{`
        @keyframes d360-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes d360-up {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        .d360-input::placeholder { color: var(--text-3); opacity: 1; }
      `}</style>
    </>
  )
}
