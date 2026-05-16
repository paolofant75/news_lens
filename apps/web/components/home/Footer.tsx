// Sezione finale — tagline serif + CTA primario + link minimi.
// Sobrio, definitivo: chiude il discorso editoriale della landing.

import Link from 'next/link'
import TrackedCTA from './TrackedCTA'

const LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/privacy/elimina-dati', label: 'Elimina dati' },
  { href: '#methodology', label: 'Metodologia' },
  { href: 'mailto:contatti@lensveritas.local', label: 'Contatti' },
]

export default function Footer() {
  return (
    <footer
      className="fade-in"
      style={{
        paddingTop: 120,
        paddingBottom: 96,
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
      }}
    >
      <div className="mx-auto px-6" style={{ maxWidth: 880 }}>

        <h2
          style={{
            fontSize: 'clamp(36px, 5vw, 56px)',
            lineHeight: 1.1,
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: 16,
            letterSpacing: '-0.01em',
          }}
        >
          Lens Veritas — News, refracted.
        </h2>

        <p
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: 'var(--text-2)',
            marginBottom: 48,
            maxWidth: 560,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Una piattaforma editoriale per chi ha bisogno di capire, non solo di restare aggiornato.
        </p>

        <div className="flex justify-center mb-16">
          <TrackedCTA source="footer" variant="primary" label="Entra nel feed" />
        </div>

        {/* Link minimi */}
        <nav
          className="mono text-xs flex flex-wrap justify-center gap-x-6 gap-y-2"
          style={{
            color: 'var(--text-3)',
            letterSpacing: '0.04em',
          }}
        >
          {LINKS.map((l, i) => (
            <span key={l.href} className="flex items-center gap-6">
              <Link href={l.href} className="hover:opacity-80" style={{ color: 'var(--text-3)' }}>
                {l.label.toUpperCase()}
              </Link>
              {i < LINKS.length - 1 && <span>·</span>}
            </span>
          ))}
        </nav>

        <p
          className="mono text-xs mt-12"
          style={{ color: 'var(--text-3)', opacity: 0.5 }}
        >
          © {new Date().getFullYear()} LENS VERITAS · BUILT FOR SIGNAL
        </p>

      </div>
    </footer>
  )
}
