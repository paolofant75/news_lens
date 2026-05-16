import PageLayout from '../../components/page-layout'

export const metadata = {
  title: 'Copyright & Segnalazioni — Lens Veritas',
  description: 'Procedura di segnalazione violazioni copyright per Lens Veritas',
}

const LAST_UPDATED = '15 maggio 2026'

export default function CopyrightPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
            Copyright & Segnalazioni
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            Ultimo aggiornamento: {LAST_UPDATED}
          </p>
        </div>

        {/* Banner versione multilingua (richiesto dagli scanner di compliance) */}
        <div
          className="mb-8 rounded-lg p-3 text-xs flex items-center justify-between gap-3"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
        >
          <span>Questo documento è disponibile anche in inglese.</span>
          <a href="/en/copyright" className="underline shrink-0 hover:opacity-80" style={{ color: 'var(--accent)' }}>
            English version →
          </a>
        </div>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>Come funziona Lens Veritas</h2>
            <p>
              Lens Veritas aggrega titoli, estratti e link da fonti giornalistiche terze (NewsAPI, The Guardian, GNews, GDELT, feed RSS pubblici). I contenuti originali rimangono di proprietà delle rispettive testate. Ogni articolo visualizzato include un link diretto alla fonte originale. Le analisi prodotte da AI (Claude di Anthropic) sono sintesi editoriali generate automaticamente, non copie integrali degli articoli sorgente.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>Segnalazione di una violazione</h2>
            <p className="mb-4">
              Se sei titolare dei diritti su contenuti visualizzati su Lens Veritas e ritieni che vi sia una violazione del diritto d&apos;autore ai sensi della L. 633/1941 o della Direttiva UE 2019/790, puoi richiederne la rimozione inviando una segnalazione a:
            </p>

            <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--accent)' }}>
              <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Indirizzo di segnalazione</p>
              <a
                href="mailto:paolo_fantinel@hotmail.com?subject=Segnalazione%20Copyright%20-%20Lens%20Veritas"
                className="underline text-base"
                style={{ color: 'var(--accent)' }}
              >
                paolo_fantinel@hotmail.com
              </a>
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                Oggetto: <em>Segnalazione Copyright — Lens Veritas</em>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>Informazioni da includere nella segnalazione</h2>
            <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Il tuo nome completo e i recapiti di contatto (email, telefono)</li>
                <li>Descrizione del contenuto protetto da copyright di tua proprietà</li>
                <li>URL esatto della pagina di Lens Veritas dove compare il contenuto contestato</li>
                <li>URL o riferimento dell&apos;opera originale</li>
                <li>Dichiarazione in buona fede che l&apos;utilizzo non è autorizzato dal titolare dei diritti</li>
                <li>Dichiarazione, sotto la tua responsabilità, che le informazioni fornite sono accurate e che sei il titolare o sei autorizzato ad agire per conto del titolare</li>
                <li>Firma (anche elettronica)</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>Procedura e tempistiche</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0 mt-0.5" style={{ background: 'var(--accent)' }}>1</span>
                <p><strong style={{ color: 'var(--text)' }}>Ricezione</strong> — Confermiamo la ricezione della segnalazione entro 48 ore lavorative.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0 mt-0.5" style={{ background: 'var(--accent)' }}>2</span>
                <p><strong style={{ color: 'var(--text)' }}>Valutazione</strong> — Verifichiamo la segnalazione entro 5 giorni lavorativi.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0 mt-0.5" style={{ background: 'var(--accent)' }}>3</span>
                <p><strong style={{ color: 'var(--text)' }}>Azione</strong> — In caso di violazione accertata, il contenuto viene rimosso entro 24 ore dalla conferma.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>Segnalazioni abusive</h2>
            <p>
              Le segnalazioni false o presentate in malafede possono comportare responsabilità legale ai sensi dell&apos;art. 96 L. 633/1941. Lens Veritas si riserva il diritto di intraprendere azioni legali in caso di segnalazioni palesemente infondate.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-6 flex items-center justify-between text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-3)' }}>
          <span>Lens Veritas · {LAST_UPDATED}</span>
          <a href="/" className="hover:opacity-80" style={{ color: 'var(--accent)' }}>← Torna alla home</a>
        </div>

      </div>
    </PageLayout>
  )
}
