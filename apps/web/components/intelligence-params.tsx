'use client'

import type { IntelligenceParams } from '../lib/intelligence'

type Props = {
  params: IntelligenceParams
  onChange: (p: IntelligenceParams) => void
  disabled?: boolean
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <span className="text-xs" style={{ color: 'var(--text-2)' }}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="w-8 h-4 rounded-full relative transition-colors flex-shrink-0"
        style={{ background: checked ? 'var(--accent)' : 'var(--border)' }}
      >
        <span
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform"
          style={{ transform: checked ? 'translateX(17px)' : 'translateX(2px)' }}
        />
      </button>
    </label>
  )
}

export default function IntelligenceParams({ params, onChange, disabled }: Props) {
  const set = <K extends keyof IntelligenceParams>(key: K, val: IntelligenceParams[K]) =>
    onChange({ ...params, [key]: val })

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', opacity: disabled ? 0.5 : 1 }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
        Parametri Intelligence
      </p>

      {/* Depth level */}
      <div>
        <p className="text-xs mb-1.5" style={{ color: 'var(--text-3)' }}>Profondità analisi</p>
        <div className="flex gap-1.5">
          {(['standard', 'deep', 'exhaustive'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => set('depth_level', d)}
              disabled={disabled}
              className="flex-1 py-1 rounded text-xs font-medium capitalize transition-colors"
              style={params.depth_level === d
                ? { background: 'var(--accent)', color: '#000' }
                : { background: 'var(--bg-s)', color: 'var(--text-3)', border: '1px solid var(--border)' }}
            >
              {d === 'standard' ? 'Standard' : d === 'deep' ? 'Profonda' : 'Esaustiva'}
            </button>
          ))}
        </div>
      </div>

      {/* Fact check mode */}
      <div>
        <p className="text-xs mb-1.5" style={{ color: 'var(--text-3)' }}>Verifica fatti</p>
        <div className="flex gap-1.5">
          {(['basic', 'strict', 'forensic'] as const).map((m) => (
            <button key={m} type="button" onClick={() => set('fact_check_mode', m)} disabled={disabled}
              className="flex-1 py-1 rounded text-xs font-medium capitalize transition-colors"
              style={params.fact_check_mode === m
                ? { background: 'var(--accent)', color: '#000' }
                : { background: 'var(--bg-s)', color: 'var(--text-3)', border: '1px solid var(--border)' }}>
              {m === 'basic' ? 'Base' : m === 'strict' ? 'Rigorosa' : 'Forense'}
            </button>
          ))}
        </div>
      </div>

      {/* Historical years */}
      <div>
        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-3)' }}>
          <span>Contesto storico</span>
          <span style={{ color: 'var(--accent)' }}>{params.historical_context_years === 0 ? 'Nessuno' : `${params.historical_context_years} anni`}</span>
        </div>
        <input type="range" min={0} max={50} step={5} value={params.historical_context_years}
          onChange={(e) => set('historical_context_years', Number(e.target.value))}
          disabled={disabled}
          className="w-full h-1 rounded appearance-none cursor-pointer"
          style={{ accentColor: 'var(--accent)' }} />
      </div>

      {/* Toggles */}
      <div className="space-y-2 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
        <Toggle label="Analisi geopolitica" checked={params.geopolitical_context} onChange={(v) => set('geopolitical_context', v)} />
        <Toggle label="Scansione disinformazione" checked={params.disinformation_scan} onChange={(v) => set('disinformation_scan', v)} />
        <Toggle label="Visioni contrastanti" checked={params.contradictory_views} onChange={(v) => set('contradictory_views', v)} />
        <Toggle label="Timeline storica" checked={params.timeline_generation} onChange={(v) => set('timeline_generation', v)} />
        <Toggle label="Analisi multilingua" checked={params.cross_language_analysis} onChange={(v) => set('cross_language_analysis', v)} />
        <Toggle label="Validazione scientifica" checked={params.scientific_validation} onChange={(v) => set('scientific_validation', v)} />
      </div>
    </div>
  )
}
