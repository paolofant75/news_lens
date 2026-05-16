// Sezione Hero — above the fold.
// Headline serif grande, sottotitolo sans, 2 CTA, strip metriche mono.

import TrackedCTA from './TrackedCTA'

export default function Hero() {
  return (
    <section className="fade-in" style={{ paddingTop: 96, paddingBottom: 96 }}>
      <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>

        {/* Eyebrow micro-label */}
        <p
          className="mono text-xs mb-8 tracking-widest"
          style={{ color: 'var(--text-3)' }}
        >
          LENS&nbsp;VERITAS&nbsp;·&nbsp;NEWS INTELLIGENCE PLATFORM
        </p>

        {/* Headline */}
        <h1
          style={{
            fontSize: 'clamp(48px, 8vw, 88px)',
            lineHeight: 1.02,
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: 32,
            maxWidth: 920,
          }}
        >
          Capire il mondo, non solo leggerlo.
        </h1>

        {/* Sottotitolo */}
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.55,
            color: 'var(--text-2)',
            maxWidth: 720,
            marginBottom: 48,
          }}
        >
          Aggreghiamo 30+ fonti internazionali e applichiamo un sistema di 9 agenti AI
          per verificare i fatti, misurare il bias e ricostruire il contesto geopolitico
          di ogni notizia.
        </p>

        {/* CTA */}
        <div className="flex flex-wrap items-center gap-4 mb-20">
          <TrackedCTA source="hero" variant="primary" label="Entra nel feed" />
          <a
            href="#methodology"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-sm transition-opacity hover:opacity-85"
            style={{
              background: 'transparent',
              color: 'var(--text)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            Come funziona
          </a>
        </div>

        {/* Strip metriche mono — sotto la fold-line */}
        <div
          className="mono text-xs flex flex-wrap gap-x-6 gap-y-2 pt-8"
          style={{
            color: 'var(--text-3)',
            borderTop: '1px solid var(--border)',
            letterSpacing: '0.04em',
          }}
        >
          <span>30+ FONTI</span>
          <span style={{ color: 'var(--text-3)' }}>·</span>
          <span>9 AGENTI AI</span>
          <span style={{ color: 'var(--text-3)' }}>·</span>
          <span>ANALISI BIAS PER OGNI ARTICOLO</span>
          <span style={{ color: 'var(--text-3)' }}>·</span>
          <span>0 ALGORITMI DI ENGAGEMENT</span>
        </div>

      </div>
    </section>
  )
}
