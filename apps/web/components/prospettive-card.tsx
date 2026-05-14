type Source = {
  source: string
  title: string
  link: string
  summary?: string
}

type Analisi = {
  completezza: number
  bias: number
  tipo_bias: string
  nota: string
}

type Polo = {
  src: Source
  analisi: Analisi
}

const TIPO_LABEL: Record<string, string> = {
  neutro:            'Lettura equilibrata',
  sensazionalistico: 'Lettura sensazionalistica',
  politico:          'Lettura con angolazione politica',
  critico:           'Lettura critica',
  favorevole:        'Lettura favorevole',
  allarmistico:      'Lettura allarmistica',
  ottimistico:       'Lettura ottimistica',
}

function BiasBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full rounded-full h-1" style={{ background: 'var(--border)' }}>
      <div className="h-1 rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
    </div>
  )
}

function PerspCard({ polo, side }: { polo: Polo; side: 'A' | 'B' }) {
  const isNeutral = side === 'A'
  const accentColor = isNeutral ? '#22c55e' : '#f97316'
  const label = TIPO_LABEL[polo.analisi.tipo_bias] ?? `Lettura ${side}`
  const sideLabel = isNeutral ? 'Lettura equilibrata' : 'Lettura con angolazione'

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 h-full"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${accentColor}40`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: `${accentColor}20`, color: accentColor }}
          >
            {sideLabel}
          </span>
          <span className="text-[9px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>
            {label}
          </span>
        </div>
        <a
          href={polo.src.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium transition-opacity hover:opacity-70 shrink-0"
          style={{ color: 'var(--accent)' }}
        >
          Apri ↗
        </a>
      </div>

      {/* Fonte */}
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>
        {polo.src.source}
      </p>

      {/* Titolo */}
      <p className="text-sm font-medium leading-snug line-clamp-3" style={{ color: 'var(--text)' }}>
        {polo.src.title}
      </p>

      {/* Nota analisi */}
      <p className="text-xs leading-relaxed flex-1" style={{ color: 'var(--text-2)' }}>
        {polo.analisi.nota}
      </p>

      {/* Metriche */}
      <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
        <div>
          <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--text-3)' }}>
            <span>Completezza</span>
            <span style={{ color: '#22c55e' }}>{polo.analisi.completezza}%</span>
          </div>
          <BiasBar value={polo.analisi.completezza} color="#22c55e" />
        </div>
        <div>
          <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--text-3)' }}>
            <span>Angolazione</span>
            <span style={{ color: polo.analisi.bias <= 20 ? '#22c55e' : polo.analisi.bias <= 50 ? '#eab308' : '#ef4444' }}>
              {polo.analisi.bias}%
            </span>
          </div>
          <BiasBar
            value={polo.analisi.bias}
            color={polo.analisi.bias <= 20 ? '#22c55e' : polo.analisi.bias <= 50 ? '#eab308' : '#ef4444'}
          />
        </div>
      </div>
    </div>
  )
}

export default function ProspettiveCard({ poleA, poleB }: { poleA: Polo; poleB: Polo }) {
  return (
    <div className="mt-8">
      {/* Header sezione */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <p className="text-xs font-semibold uppercase tracking-widest px-3" style={{ color: 'var(--text-3)' }}>
          Stessa notizia, due letture
        </p>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      {/* Epistemological label */}
      <div className="rounded-lg p-3 mb-5" style={{ background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
          <span style={{ color: '#3b82f6', fontWeight: 600 }}>Veritas non prende posizione.</span> Le fonti coprono l'argomento con angolazioni diverse. Questo strato mostra due letture: una più neutrale (Polo A) e una con angolazione marcata (Polo B). Confrontarle aiuta a capire meglio i presupposti di ciascun approccio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PerspCard polo={poleA} side="A" />
        <PerspCard polo={poleB} side="B" />
      </div>
    </div>
  )
}
