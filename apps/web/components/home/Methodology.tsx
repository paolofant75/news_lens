// Sezione Metodologia — cuore della pagina.
// 4 step: Aggregazione / Scoring / Multi-agente / Consolidamento.
// Layout orizzontale su desktop, verticale su mobile.
// Ancora #methodology referenziata dal CTA secondario in hero.

import { IconAggregation, IconScale, IconAgents, IconConsolidate } from './LineIcons'
import type { ComponentType } from 'react'

interface Step {
  num: string
  title: string
  body: string
  icon: ComponentType<{ size?: number; className?: string }>
}

const STEPS: Step[] = [
  {
    num: '01',
    title: 'Aggregazione',
    body: '30+ fonti internazionali (Reuters, AP, BBC, ANSA, Al Jazeera, Bellingcat). Ogni fonte è valutata per coerenza fattuale storica, trasparenza editoriale e indipendenza dalla propaganda di stato.',
    icon: IconAggregation,
  },
  {
    num: '02',
    title: 'Scoring delle fonti',
    body: 'Ogni testata ha uno score di affidabilità (5.0–9.5) trasparente e visibile. Le fonti state-aligned ricevono una penalizzazione sistematica. Il bias non viene nascosto, viene reso esplicito.',
    icon: IconScale,
  },
  {
    num: '03',
    title: 'Analisi multi-agente AI',
    body: '9 agenti AI specializzati lavorano in parallelo: fact-checking, geopolitica, intelligence economica, rilevamento propaganda, timeline storica, conflitti narrativi. Ogni output è grounded sulle fonti reali (RAG), non sull’opinione del modello.',
    icon: IconAgents,
  },
  {
    num: '04',
    title: 'Consolidamento',
    body: 'La piattaforma produce un articolo bias-free e le 5W (Chi/Cosa/Dove/Quando/Perché) verificate. Fatti e interpretazioni vengono separati esplicitamente.',
    icon: IconConsolidate,
  },
]

export default function Methodology() {
  return (
    <section
      id="methodology"
      className="fade-in"
      style={{
        paddingTop: 96,
        paddingBottom: 96,
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>

        <p
          className="mono text-xs mb-6 tracking-widest"
          style={{ color: 'var(--text-3)' }}
        >
          METODOLOGIA
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
          Come la piattaforma trasforma il rumore in segnale.
        </h2>

        <div
          className="grid gap-8"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
        >
          {STEPS.map(({ num, title, body, icon: Icon }) => (
            <div
              key={num}
              style={{
                padding: 24,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 2,
              }}
            >
              <div className="flex items-center justify-between mb-8">
                <span
                  className="mono"
                  style={{
                    fontSize: 28,
                    fontWeight: 500,
                    color: 'var(--accent)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {num}
                </span>
                <Icon size={24} className="opacity-60" />
              </div>

              <h3
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: 'var(--text)',
                  marginBottom: 12,
                  lineHeight: 1.2,
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: 'var(--text-2)',
                }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
