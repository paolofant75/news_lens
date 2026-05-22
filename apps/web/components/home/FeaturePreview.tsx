// Sezione "Cosa trovi nel feed" — 3 card affiancate con mock SVG stilizzati.
// Ogni card linka alla sezione corrispondente della dashboard.

import Link from 'next/link'
import { IconGlobe, IconVeritas, IconIntelligence, IconArrow } from './LineIcons'

// ─────────────────────────────────────────────────────────────────────────
// Mock SVG: rendono visivamente l'idea senza screenshot reali
// ─────────────────────────────────────────────────────────────────────────

function MockGlobe() {
  return (
    <svg viewBox="0 0 280 140" className="w-full" style={{ height: 140 }}>
      {/* grid background */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="280" height="140" fill="url(#grid)" />
      {/* globo stilizzato */}
      <circle cx="140" cy="70" r="48" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <ellipse cx="140" cy="70" rx="48" ry="18" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <path d="M140 22 Q160 70 140 118 Q120 70 140 22" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      {/* marker eventi (proporzionali alla rilevanza) */}
      <circle cx="118" cy="58" r="5" fill="#2e7eff" />
      <circle cx="118" cy="58" r="10" fill="none" stroke="#2e7eff" strokeWidth="1" opacity="0.4" />
      <circle cx="155" cy="80" r="3" fill="#2e7eff" />
      <circle cx="170" cy="48" r="2" fill="#2e7eff" />
      <circle cx="100" cy="92" r="2" fill="#2e7eff" />
    </svg>
  )
}

function MockVeritas() {
  return (
    <svg viewBox="0 0 280 140" className="w-full" style={{ height: 140 }}>
      {/* righe articolo */}
      <rect x="20" y="20" width="240" height="2" fill="rgba(255,255,255,0.18)" />
      <rect x="20" y="32" width="180" height="2" fill="rgba(255,255,255,0.12)" />
      <rect x="20" y="44" width="220" height="2" fill="rgba(255,255,255,0.12)" />
      <rect x="20" y="56" width="160" height="2" fill="rgba(255,255,255,0.12)" />
      {/* barra bias 1 */}
      <rect x="20" y="78" width="120" height="6" fill="#22c55e" opacity="0.7" />
      <rect x="140" y="78" width="60" height="6" fill="rgba(255,255,255,0.12)" />
      <text x="206" y="84" fill="#9ca3af" fontSize="9" fontFamily="monospace">8.4</text>
      {/* barra bias 2 */}
      <rect x="20" y="92" width="80" height="6" fill="#eab308" opacity="0.7" />
      <rect x="100" y="92" width="100" height="6" fill="rgba(255,255,255,0.12)" />
      <text x="206" y="98" fill="#9ca3af" fontSize="9" fontFamily="monospace">6.7</text>
      {/* barra bias 3 */}
      <rect x="20" y="106" width="40" height="6" fill="#ef4444" opacity="0.7" />
      <rect x="60" y="106" width="140" height="6" fill="rgba(255,255,255,0.12)" />
      <text x="206" y="112" fill="#9ca3af" fontSize="9" fontFamily="monospace">4.2</text>
    </svg>
  )
}

function MockIntelligence() {
  return (
    <svg viewBox="0 0 280 140" className="w-full" style={{ height: 140 }}>
      {/* search bar */}
      <rect x="20" y="20" width="240" height="24" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <text x="32" y="36" fill="#9ca3af" fontSize="10" fontFamily="monospace">{'> ANALYZE TOPIC'}</text>
      <rect x="252" y="26" width="2" height="12" fill="#2e7eff">
        <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
      </rect>
      {/* agent nodes */}
      <circle cx="50" cy="80" r="6" fill="none" stroke="#2e7eff" strokeWidth="1.5" />
      <circle cx="100" cy="70" r="6" fill="none" stroke="#2e7eff" strokeWidth="1.5" />
      <circle cx="150" cy="90" r="6" fill="none" stroke="#2e7eff" strokeWidth="1.5" />
      <circle cx="200" cy="70" r="6" fill="none" stroke="#2e7eff" strokeWidth="1.5" />
      <circle cx="240" cy="80" r="6" fill="none" stroke="#2e7eff" strokeWidth="1.5" />
      {/* connections */}
      <path d="M56 80 L94 70 M106 70 L144 90 M156 90 L194 70 M206 70 L234 80" stroke="rgba(46,126,255,0.4)" strokeWidth="1" />
      {/* result row */}
      <rect x="20" y="110" width="240" height="2" fill="rgba(255,255,255,0.12)" />
      <rect x="20" y="118" width="180" height="2" fill="rgba(255,255,255,0.10)" />
      <rect x="20" y="126" width="200" height="2" fill="rgba(255,255,255,0.08)" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────

interface Feature {
  title: string
  body: string
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  mock: React.ComponentType
}

const FEATURES: Feature[] = [
  {
    title: 'Globe Intelligence Map',
    body: 'Mappa 3D con marker proporzionali alla rilevanza geopolitica. Copertura garantita per ogni regione del pianeta — nessuna bolla geografica.',
    href: '/mappa',
    icon: IconGlobe,
    mock: MockGlobe,
  },
  {
    title: 'Veritas Analysis',
    body: 'Per ogni articolo: analisi del bias di ogni fonte, articolo consolidato senza valutazioni editoriali, 5W verificate. Fatti separati dalle interpretazioni.',
    href: '/veritas',
    icon: IconVeritas,
    mock: MockVeritas,
  },
  {
    title: 'Intelligence Engine',
    body: 'Deep research multi-agente su qualsiasi topic in 60 secondi. 9 agenti AI lavorano in parallelo, ogni claim resta tracciabile fino alla fonte primaria.',
    href: '/intelligence',
    icon: IconIntelligence,
    mock: MockIntelligence,
  },
]

export default function FeaturePreview() {
  return (
    <section id="features" className="fade-in" style={{ paddingTop: 96, paddingBottom: 96 }}>
      <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>

        <p
          className="mono text-xs mb-6 tracking-widest"
          style={{ color: 'var(--text-3)' }}
        >
          COSA TROVI NEL FEED
        </p>

        <h2
          style={{
            fontSize: 'clamp(32px, 4.5vw, 48px)',
            lineHeight: 1.1,
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: 64,
            maxWidth: 820,
          }}
        >
          Tre strumenti, una visione coerente.
        </h2>

        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
        >
          {FEATURES.map(({ title, body, href, icon: Icon, mock: Mock }) => (
            <div
              key={title}
              style={{
                padding: 24,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <Icon size={22} className="opacity-70" />
                <h3
                  style={{
                    fontSize: 19,
                    fontWeight: 600,
                    color: 'var(--text)',
                    lineHeight: 1.2,
                  }}
                >
                  {title}
                </h3>
              </div>

              {/* Mock SVG */}
              <div
                className="mb-5"
                style={{
                  background: '#0a0a0a',
                  border: '1px solid var(--border)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Mock />
              </div>

              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: 'var(--text-2)',
                  marginBottom: 16,
                  flex: 1,
                }}
              >
                {body}
              </p>

              <Link
                href={href}
                className="inline-flex items-center gap-2 mono text-xs hover:opacity-80"
                style={{ color: 'var(--accent)', letterSpacing: '0.04em' }}
              >
                VEDI NEL FEED <IconArrow size={14} />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
