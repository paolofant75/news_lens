import PageLayout from '../../components/page-layout'

export const metadata = {
  title: 'Privacy Policy — Veritas Lens',
  description: 'Informativa sulla privacy di Veritas Lens',
}

const LAST_UPDATED = '13 maggio 2026'

export default function PrivacyPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
            Privacy Policy
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            Ultimo aggiornamento: {LAST_UPDATED}
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>1. Chi siamo</h2>
            <p>
              Veritas Lens (<strong>news-lens-psi.vercel.app</strong>) è un aggregatore di notizie globale con analisi AI anti-bias. Il servizio è gestito a titolo personale e non commerciale. Per qualsiasi questione relativa alla privacy puoi contattarci all&apos;indirizzo: <a href="mailto:paolo_fantinel@hotmail.com" className="underline" style={{ color: 'var(--accent)' }}>paolo_fantinel@hotmail.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>2. Dati che raccogliamo</h2>
            <div className="space-y-3">
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>Account utente (opzionale)</p>
                <p>Se scegli di registrarti: indirizzo email, nome display, provider di autenticazione usato (email, Google o Facebook). La registrazione non è obbligatoria per usare il sito.</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>Attività di utilizzo (solo utenti registrati)</p>
                <p>Articoli letti e ricerche effettuate su Veritas, per mostrarti la cronologia nel tuo profilo. Questi dati non vengono venduti né condivisi con terzi.</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>Preferenze di visualizzazione</p>
                <p>Tema (Noir/Bureau), lingua e colore accent, salvati in cookie locali nel tuo browser. Non vengono trasmessi ai nostri server.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>3. Come usiamo i dati</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Autenticare il tuo accesso e mantenere la sessione</li>
              <li>Mostrarti la cronologia degli articoli letti e delle ricerche nel profilo</li>
              <li>Migliorare il servizio in forma aggregata e anonima</li>
              <li>Non utilizziamo i tuoi dati per pubblicità, profilazione commerciale o vendita a terzi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>4. Servizi terzi utilizzati</h2>
            <div className="space-y-2">
              {[
                { name: 'Supabase', use: 'Database utenti e autenticazione', link: 'https://supabase.com/privacy' },
                { name: 'Vercel', use: 'Hosting e infrastruttura del sito', link: 'https://vercel.com/legal/privacy-policy' },
                { name: 'Google OAuth', use: 'Login con account Google (opzionale)', link: 'https://policies.google.com/privacy' },
                { name: 'Meta / Facebook', use: 'Login con account Facebook (opzionale)', link: 'https://www.facebook.com/privacy/policy' },
                { name: 'Anthropic Claude', use: 'Analisi AI anti-bias delle notizie (Veritas)', link: 'https://www.anthropic.com/privacy' },
                { name: 'Google Gemini', use: 'Sintesi vocale degli articoli (Audio Reader)', link: 'https://policies.google.com/privacy' },
                { name: 'Upstash Redis', use: 'Cache temporanea degli articoli (max 3 minuti)', link: 'https://upstash.com/trust/privacy.pdf' },
                { name: 'NewsAPI / GNews / The Guardian API', use: 'Fonte degli articoli di notizie', link: '#' },
              ].map((s) => (
                <div key={s.name} className="flex items-start justify-between gap-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <span className="font-medium" style={{ color: 'var(--text)' }}>{s.name}</span>
                    <span className="ml-2">{s.use}</span>
                  </div>
                  {s.link !== '#' && (
                    <a href={s.link} target="_blank" rel="noopener noreferrer"
                      className="text-xs shrink-0 hover:underline" style={{ color: 'var(--accent)' }}>
                      Privacy ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>5. Cookie</h2>
            <p className="mb-2">Utilizziamo esclusivamente cookie tecnici, necessari al funzionamento del sito:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li><code className="text-xs px-1 py-0.5 rounded" style={{ background: 'var(--bg-card)' }}>nlv_lang</code> — lingua selezionata</li>
              <li><code className="text-xs px-1 py-0.5 rounded" style={{ background: 'var(--bg-card)' }}>nlv_palette</code> — tema grafico (Noir/Bureau)</li>
              <li><code className="text-xs px-1 py-0.5 rounded" style={{ background: 'var(--bg-card)' }}>sb-* </code> — sessione di autenticazione Supabase (solo se registrato)</li>
            </ul>
            <p className="mt-2">Non utilizziamo cookie di tracciamento, analitici o pubblicitari di terze parti.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>6. Conservazione dei dati</h2>
            <p>
              I dati dell&apos;account vengono conservati finché mantieni il tuo profilo attivo. Puoi richiedere la cancellazione in qualsiasi momento scrivendo a <a href="mailto:paolo_fantinel@hotmail.com" className="underline" style={{ color: 'var(--accent)' }}>paolo_fantinel@hotmail.com</a>. La cache degli articoli viene eliminata automaticamente ogni 3 minuti.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>7. I tuoi diritti (GDPR)</h2>
            <p className="mb-2">Se sei residente nell&apos;Unione Europea, hai diritto a:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Accedere ai tuoi dati personali</li>
              <li>Richiedere la rettifica o la cancellazione</li>
              <li>Opporti al trattamento</li>
              <li>Richiedere la portabilità dei dati</li>
            </ul>
            <p className="mt-2">
              Per esercitare questi diritti scrivi a <a href="mailto:paolo_fantinel@hotmail.com" className="underline" style={{ color: 'var(--accent)' }}>paolo_fantinel@hotmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>8. Modifiche a questa policy</h2>
            <p>
              Eventuali aggiornamenti verranno pubblicati su questa pagina con la data di revisione. L&apos;uso continuato del servizio dopo le modifiche costituisce accettazione della nuova policy.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-6 flex items-center justify-between text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-3)' }}>
          <span>Veritas Lens · {LAST_UPDATED}</span>
          <a href="/" className="hover:opacity-80" style={{ color: 'var(--accent)' }}>← Torna alla home</a>
        </div>

      </div>
    </PageLayout>
  )
}
