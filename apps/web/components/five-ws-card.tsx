'use client'

import type { FiveWs } from '../lib/veritas'
import InfographicDownload from './infographic-download'

const LABELS: { key: keyof FiveWs; icon: string; label: string }[] = [
  { key: 'who',   icon: '👤', label: 'Who' },
  { key: 'what',  icon: '📌', label: 'What' },
  { key: 'where', icon: '📍', label: 'Where' },
  { key: 'when',  icon: '🕐', label: 'When' },
  { key: 'why',   icon: '💡', label: 'Why' },
]

type Props = {
  five_ws: FiveWs
  title: string
  palette?: string
}

export default function FiveWsCard({ five_ws, title, palette }: Props) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4" style={{ background: 'var(--accent)' }}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-base" style={{ color: '#fff', fontFamily: 'var(--font-h)' }}>
            Five Ws
          </span>
          <span className="text-xs opacity-70" style={{ color: '#fff' }}>· Essenza della notizia</span>
        </div>
        <InfographicDownload title={title} five_ws={five_ws} palette={palette} />
      </div>

      {/* Grid 5Ws */}
      <div className="grid grid-cols-1 sm:grid-cols-5" style={{ background: 'var(--bg-card)' }}>
        {LABELS.map(({ key, icon, label }, i) => (
          <div
            key={key}
            className="p-4"
            style={{
              borderRight: i < 4 ? '1px solid var(--border)' : 'none',
              borderBottom: '0',
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-sm">{icon}</span>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                {label}
              </span>
            </div>
            <p className="text-sm leading-snug" style={{ color: 'var(--text)' }}>
              {five_ws[key] || '–'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
