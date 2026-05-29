import PageLayout from '../../components/page-layout'
import { IconAlert } from '../../components/icons'

export const metadata = {
  title: 'Termini di Servizio — Lens Veritas',
  description: 'Termini e condizioni di utilizzo di Lens Veritas',
}

const LAST_UPDATED = '15 maggio 2026'

export default function TermsPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
            Termini di Servizio
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
          <a href="/en/terms" className="underline shrink-0 hover:opacity-80" style={{ color: 'var(--accent)' }}>
            English version →
          </a>
        </div>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>1. Descrizione del servizio</h2>
            <p>
              Lens Veritas (<strong>lensveritas.com</strong>) è un aggregatore di notizie globale con analisi AI anti-bias. Il servizio è gestito a titolo personale e non commerciale da Paolo Fantinel. Lens Veritas aggrega titoli e contenuti da fonti terze (NewsAPI, The Guardian, GNews, GDELT, feed RSS) e utilizza modelli di intelligenza artificiale (Anthropic Claude, Google Gemini) per produrre analisi editoriali sintetiche.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>2. Accettazione dei termini</h2>
            <p>
              Accedendo o utilizzando Lens Veritas accetti i presenti Termini di Servizio. Se non accetti, ti invitiamo a non utilizzare il servizio. L&apos;uso continuato dopo eventuali modifiche costituisce accettazione dei termini aggiornati.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>3. Contenuto AI — limitazioni e disclaimer</h2>
            <div className="rounded-xl p-4 mb-3" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)' }}>
              <p className="inline-flex items-center gap-2 font-medium mb-1" style={{ color: 'var(--text)' }}><IconAlert size={14} /> Contenuto generato da intelligenza artificiale</p>
              <p>
                L&apos;Articolo Consolidato Veritas e le analisi di bias sono generati automaticamente da modelli AI (Claude di Anthropic). Tali contenuti possono contenere imprecisioni, omissioni o errori. Lens Veritas non garantisce l&apos;accuratezza, la completezza o l&apos;attualità delle analisi AI. Non utilizzare queste informazioni come unica fonte per decisioni importanti.
              </p>
            </div>
            <p>
              Ai sensi dell&apos;art. 50(2) del Regolamento UE sull&apos;Intelligenza Artificiale (EU AI Act), i contenuti generati da AI sono marcati come tali nell&apos;interfaccia del sito.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>4. Proprietà intellettuale e diritti d&apos;autore</h2>
            <p className="mb-2">
              Gli articoli aggregati rimangono di proprietà delle rispettive testate giornalistiche. Lens Veritas visualizza estratti e titoli ai fini informativi, con link diretto alla fonte originale, nel rispetto del diritto di citazione ai sensi dell&apos;art. 70 L. 633/1941 e della Direttiva UE 2019/790.
            </p>
            <p>
              Se sei titolare di diritti su contenuti visualizzati su Lens Veritas e ritieni che vi sia una violazione, consulta la nostra <a href="/copyright" className="underline" style={{ color: 'var(--accent)' }}>procedura di segnalazione copyright</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>5. Utilizzo accettabile</h2>
            <p className="mb-2">Utilizzando Lens Veritas ti impegni a non:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Effettuare scraping automatizzato dei contenuti del sito</li>
              <li>Utilizzare il servizio per attività illegali o in violazione di diritti di terzi</li>
              <li>Tentare di accedere a sistemi o dati non autorizzati</li>
              <li>Distribuire o pubblicare le analisi AI come se fossero prodotte da giornalisti umani senza indicarne l&apos;origine</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>6. Limitazione di responsabilità</h2>
            <p>
              Lens Veritas è fornito &quot;così com&apos;è&quot; senza garanzie di alcun tipo. Il gestore non è responsabile per eventuali danni diretti o indiretti derivanti dall&apos;uso del servizio, dall&apos;affidamento su contenuti AI, o dall&apos;indisponibilità temporanea del servizio.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>7. Legge applicabile e foro competente</h2>
            <p>
              I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente il Tribunale di Treviso (Italia).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>8. Contatti</h2>
            <p>
              Per qualsiasi questione relativa ai presenti Termini scrivi a{' '}
              <a href="mailto:paolo_fantinel@hotmail.com" className="underline" style={{ color: 'var(--accent)' }}>
                paolo_fantinel@hotmail.com
              </a>.
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
