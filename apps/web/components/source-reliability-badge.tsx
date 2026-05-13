import type { SourceReliabilityScore } from '../lib/intelligence'

type Props = {
  reliability?: number
  bias?: string
  score?: SourceReliabilityScore
  compact?: boolean
}

type Classification = 'verified' | 'disputed' | 'unverified' | 'propaganda_risk'

const CONFIG: Record<Classification, { label: string; color: string; icon: string; bg: string }> = {
  verified:        { label: 'Verificato',  color: '#22c55e', icon: '✓', bg: 'rgba(34,197,94,0.12)' },
  disputed:        { label: 'Discusso',    color: '#f59e0b', icon: '?', bg: 'rgba(245,158,11,0.12)' },
  unverified:      { label: 'Non verif.',  color: '#94a3b8', icon: '–', bg: 'rgba(148,163,184,0.1)'  },
  propaganda_risk: { label: 'Propaganda',  color: '#ef4444', icon: '⚠', bg: 'rgba(239,68,68,0.12)'  },
}

function classify(reliability?: number, bias?: string, score?: SourceReliabilityScore): Classification {
  if (score?.classification) return score.classification
  if (bias === 'state-aligned' && (reliability ?? 10) < 7.0) return 'propaganda_risk'
  if ((reliability ?? 0) >= 8.5 && ['center', 'center-left', 'center-right'].includes(bias ?? '')) return 'verified'
  if ((reliability ?? 0) >= 6.5 || bias === 'mixed') return 'disputed'
  return 'unverified'
}

const SUB_SCORES: { key: keyof SourceReliabilityScore; label: string }[] = [
  { key: 'factual_consistency',   label: 'Coerenza fattuale' },
  { key: 'historical_reliability', label: 'Affidabilità storica' },
  { key: 'ideological_bias',      label: 'Bias ideologico' },
  { key: 'source_transparency',   label: 'Trasparenza fonte' },
  { key: 'evidence_quality',      label: 'Qualità prove' },
]

export default function SourceReliabilityBadge({ reliability, bias, score, compact = false }: Props) {
  const cls = classify(reliability, bias, score)
  const { label, color, icon, bg } = CONFIG[cls]

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
        style={{ background: bg, color, border: `1px solid ${color}33` }}
        title={score ? `Affidabilità: ${score.overall}/100` : `Reliability: ${reliability ?? '?'}/10`}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </span>
    )
  }

  return (
    <div className="rounded-lg p-3" style={{ background: bg, border: `1px solid ${color}33` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold flex items-center gap-1.5" style={{ color }}>
          <span>{icon}</span>
          <span>{label}</span>
        </span>
        {score && (
          <span className="text-xs font-mono font-bold" style={{ color }}>{score.overall}/100</span>
        )}
      </div>

      {score && (
        <div className="space-y-1.5">
          {SUB_SCORES.map(({ key, label: slabel }) => {
            const val = score[key] as number
            const barColor = key === 'ideological_bias'
              ? (val > 60 ? '#ef4444' : val > 30 ? '#f59e0b' : '#22c55e')
              : (val >= 70 ? '#22c55e' : val >= 40 ? '#f59e0b' : '#ef4444')
            return (
              <div key={key}>
                <div className="flex justify-between text-[9px] mb-0.5" style={{ color: 'var(--text-3)' }}>
                  <span>{slabel}</span>
                  <span>{val}</span>
                </div>
                <div className="h-1 rounded-full" style={{ background: 'var(--border)' }}>
                  <div className="h-1 rounded-full" style={{ width: `${val}%`, background: barColor }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
