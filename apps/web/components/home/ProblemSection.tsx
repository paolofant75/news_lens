// Sezione "Il problema" — 3 paragrafi corti, ognuno con un numero/dato mono come ancora visiva.
// Tono sobrio, non allarmista.

const POINTS = [
  {
    metric: '2.500.000',
    unit: 'articoli/giorno',
    text: 'È il volume stimato di articoli pubblicati ogni giorno nel mondo. L’overload informativo rende impraticabile la verifica individuale.',
  },
  {
    metric: '72%',
    unit: 'adulti OCSE',
    text: 'fatica a distinguere notizie verificate da contenuti manipolati o opinione mascherata da cronaca (Reuters Digital News Report).',
  },
  {
    metric: '∞',
    unit: 'engagement loop',
    text: 'Gli algoritmi mainstream ottimizzano per il tempo speso e il click. Non per l’accuratezza, non per il pluralismo, non per la verità.',
  },
]

export default function ProblemSection() {
  return (
    <section className="fade-in" style={{ paddingTop: 96, paddingBottom: 96 }}>
      <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>

        <p
          className="mono text-xs mb-12 tracking-widest"
          style={{ color: 'var(--text-3)' }}
        >
          IL&nbsp;PROBLEMA
        </p>

        <div
          className="grid gap-12"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
        >
          {POINTS.map((p, i) => (
            <div key={i}>
              <div
                className="mono"
                style={{
                  fontSize: 'clamp(40px, 5vw, 56px)',
                  fontWeight: 400,
                  lineHeight: 1,
                  color: 'var(--text)',
                  marginBottom: 8,
                  letterSpacing: '-0.02em',
                }}
              >
                {p.metric}
              </div>
              <div
                className="mono text-xs mb-5 tracking-widest"
                style={{ color: 'var(--text-3)' }}
              >
                {p.unit.toUpperCase()}
              </div>
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: 'var(--text-2)',
                }}
              >
                {p.text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
