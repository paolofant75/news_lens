// Sezione "Principi" — manifesto sintetico.
// 5 affermazioni in serif italic, una per riga. Niente decorazione, peso visivo dalla tipografia.

const PRINCIPLES = [
  'Verità prima dell’engagement.',
  'Densità informativa, non viralità.',
  'Bias trasparente, mai nascosto.',
  'Equilibrio geopolitico strutturale — 50% notizie globali garantite.',
  'Nessun dark pattern, nessuna notifica manipolatoria, nessun infinite scroll.',
]

export default function Principles() {
  return (
    <section
      id="principles"
      className="fade-in"
      style={{
        paddingTop: 96,
        paddingBottom: 96,
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>

        <p
          className="mono text-xs mb-12 tracking-widest"
          style={{ color: 'var(--text-3)' }}
        >
          PRINCIPI
        </p>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {PRINCIPLES.map((p, i) => (
            <li
              key={i}
              style={{
                fontFamily: "var(--font-h)",
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 'clamp(22px, 3vw, 32px)',
                lineHeight: 1.35,
                color: 'var(--text)',
                padding: '18px 0',
                borderBottom: i < PRINCIPLES.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              {p}
            </li>
          ))}
        </ul>

      </div>
    </section>
  )
}
