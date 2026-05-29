// Sezione Hero — above the fold.
// Headline serif grande, sottotitolo sans, 2 CTA, strip metriche mono cliccabile,
// footnote esplicativa del claim DOPAMINE-FREE, chevron 'SCORRI' che invita all'esplorazione.

import TrackedCTA from './TrackedCTA'

// Voci della strip metriche — ognuna ancora-link verso la sezione corrispondente
// della pagina, cosi' funziona come mini-tabella dei contenuti.
const STRIP = [
  { label: '30+ FONTI',                       href: '#methodology' },
  { label: '9 AGENTI AI',                     href: '#methodology' },
  { label: 'BIAS MISURATO SU OGNI ARTICOLO',  href: '#features' },
  { label: 'DOPAMINE-FREE*',                  href: '#principles' },
]

export default function Hero() {
  return (
    <section className="fade-in" style={{ paddingTop: 96, paddingBottom: 48 }}>
      {/* Keyframe per l'animazione del chevron 'SCORRI' — hoisted da React */}
      <style>{`
        @keyframes lv-scroll-hint {
          0%, 100% { transform: translateY(0); opacity: 0.55; }
          50%      { transform: translateY(6px); opacity: 1; }
        }
      `}</style>

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

        {/* CTA — gerarchia invertita: primario 'Come funziona' (invita a scoprire),
            secondario 'Entra nel feed' (accesso diretto per chi e' gia' convinto). */}
        <div className="flex flex-wrap items-center gap-4 mb-16">
          <a
            href="#methodology"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-sm transition-opacity hover:opacity-85"
            style={{
              background: 'var(--accent)',
              color: '#0a0a0a',
              border: '1px solid var(--accent)',
            }}
          >
            Come funziona →
          </a>
          <TrackedCTA source="hero" variant="secondary" label="Entra nel feed" showArrow={false} />
        </div>

        {/* Strip metriche — ora cliccabile, ogni voce scrolla alla sezione corrispondente */}
        <div
          className="mono text-xs flex flex-wrap items-center gap-x-6 gap-y-2 pt-8"
          style={{
            color: 'var(--text-3)',
            borderTop: '1px solid var(--border)',
            letterSpacing: '0.04em',
          }}
        >
          {STRIP.map((item, i) => (
            <span key={item.label} className="flex items-center gap-x-6">
              <a
                href={item.href}
                className="hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-3)' }}
              >
                {item.label}
              </a>
              {i < STRIP.length - 1 && <span aria-hidden="true">·</span>}
            </span>
          ))}
        </div>

        {/* Footnote esplicativa del claim DOPAMINE-FREE */}
        <p
          className="mono mt-3"
          style={{
            fontSize: 11,
            color: 'var(--text-3)',
            opacity: 0.65,
            letterSpacing: '0.02em',
            lineHeight: 1.5,
          }}
        >
          * <span style={{ color: 'var(--text-2)' }}>dopamine-free:</span>{' '}
          nessun algoritmo che ti spinge a leggere oltre, nessuna notifica manipolatoria,
          nessuno scroll infinito. Solo le notizie che cerchi.
        </p>

        {/* Scroll affordance — chevron animato che invita all'esplorazione */}
        <div className="flex justify-center mt-14 mb-2">
          <a
            href="#problem"
            aria-label="Scorri per scoprire di piu'"
            className="mono flex flex-col items-center gap-2 hover:opacity-100 transition-opacity"
            style={{
              color: 'var(--text-3)',
              fontSize: 11,
              letterSpacing: '0.18em',
              animation: 'lv-scroll-hint 2.4s ease-in-out infinite',
            }}
          >
            <span>SCORRI</span>
            <span style={{ fontSize: 18, lineHeight: 1 }}>↓</span>
          </a>
        </div>

      </div>
    </section>
  )
}
