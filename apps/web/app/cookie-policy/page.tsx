import PageLayout from '../../components/page-layout'
import ReopenConsentLink from './reopen-consent-link'

export const metadata = {
  title: 'Cookie Policy — Lens Veritas',
  description: 'Informativa estesa sui cookie e sulle tecnologie di archiviazione utilizzate da Lens Veritas',
}

const LAST_UPDATED = '15 maggio 2026'

export default function CookiePolicyPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
            Cookie Policy
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            Ultimo aggiornamento: {LAST_UPDATED}
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>1. Cosa sono i cookie e le tecnologie simili</h2>
            <p className="mb-2">
              I cookie sono piccoli file di testo che i siti web salvano sul tuo dispositivo per memorizzare informazioni tra una visita e l&apos;altra. Lens Veritas utilizza anche tecnologie equivalenti come <strong>localStorage</strong> (archiviazione locale del browser) per memorizzare preferenze visive e il registro dei tuoi consensi.
            </p>
            <p>
              Questa Cookie Policy è redatta ai sensi dell&apos;art. 122 D.Lgs. 196/2003 (Codice Privacy), del provvedimento del Garante per la protezione dei dati personali del 10/06/2021 sui cookie e della direttiva ePrivacy 2002/58/CE.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>2. Categorie di cookie utilizzati</h2>
            <p>Lens Veritas utilizza tre categorie di tecnologie, illustrate in dettaglio nelle sezioni seguenti:</p>
            <ul className="space-y-1 list-disc list-inside mt-2">
              <li><strong style={{ color: 'var(--text)' }}>Tecnici</strong> — sempre attivi, non richiedono consenso</li>
              <li><strong style={{ color: 'var(--text)' }}>Preferenza</strong> — salvano le tue scelte di personalizzazione (non profilanti)</li>
              <li><strong style={{ color: 'var(--text)' }}>Funzionali AI &amp; analytics</strong> — attivabili solo previo tuo consenso esplicito</li>
            </ul>
            <p className="mt-3">
              <strong style={{ color: 'var(--text)' }}>Non utilizziamo</strong> cookie di tracciamento, profilazione pubblicitaria, retargeting, social plugin con tracker o analytics di terze parti come Google Analytics, Meta Pixel, Hotjar.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>3. Cookie tecnici (sempre attivi)</h2>
            <p className="mb-3">Necessari al funzionamento del sito. La loro disattivazione comprometterebbe l&apos;esperienza utente o la sessione di autenticazione.</p>
            <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
              <table className="w-full text-xs">
                <thead style={{ background: 'var(--bg-card)' }}>
                  <tr>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--text)' }}>Nome</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--text)' }}>Tipo</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--text)' }}>Durata</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--text)' }}>Finalità</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'nlv_lang', tipo: 'Cookie HTTP', durata: '365 giorni', scopo: 'Lingua dell\'interfaccia (it / en / fr / de / es / zh / hi / ar)' },
                    { name: 'nlv_palette', tipo: 'Cookie HTTP', durata: '365 giorni', scopo: 'Tema grafico selezionato (Noir / Bureau)' },
                    { name: 'nlv_font', tipo: 'Cookie HTTP', durata: '365 giorni', scopo: 'Famiglia di font utilizzata' },
                    { name: 'sb-<project>-auth-token', tipo: 'Cookie HTTP (Supabase)', durata: 'Sessione', scopo: 'Sessione di autenticazione — solo se accedi all\'account' },
                    { name: 'nlv_consent_v2', tipo: 'localStorage', durata: 'Permanente (fino a revoca)', scopo: 'Registro delle tue scelte di consenso cookie' },
                    { name: 'nlv_session_id', tipo: 'localStorage', durata: 'Permanente', scopo: 'Identificativo anonimo (UUID) usato per registrare il consenso' },
                  ].map((r) => (
                    <tr key={r.name} style={{ borderTop: '1px solid var(--border)' }}>
                      <td className="px-3 py-2 font-mono text-[11px]" style={{ color: 'var(--accent)' }}>{r.name}</td>
                      <td className="px-3 py-2" style={{ color: 'var(--text-2)' }}>{r.tipo}</td>
                      <td className="px-3 py-2" style={{ color: 'var(--text-2)' }}>{r.durata}</td>
                      <td className="px-3 py-2" style={{ color: 'var(--text-2)' }}>{r.scopo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs" style={{ color: 'var(--text-3)' }}>
              Base giuridica: art. 122 D.Lgs. 196/2003 (consenso non richiesto per cookie strettamente necessari) — art. 6(1)(f) GDPR (legittimo interesse).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>4. Cookie di preferenza (non profilanti)</h2>
            <p className="mb-3">Memorizzano le tue scelte di personalizzazione visiva. Restano sul tuo browser, non vengono mai trasmessi ai nostri server né a terze parti.</p>
            <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
              <table className="w-full text-xs">
                <thead style={{ background: 'var(--bg-card)' }}>
                  <tr>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--text)' }}>Nome</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--text)' }}>Tipo</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--text)' }}>Finalità</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'nlv_layout', tipo: 'localStorage', scopo: 'Layout articoli (griglia o lista)' },
                    { name: 'nlv_accent_noir', tipo: 'localStorage', scopo: 'Colore accent custom per tema Noir' },
                    { name: 'nlv_accent_bureau', tipo: 'localStorage', scopo: 'Colore accent custom per tema Bureau' },
                  ].map((r) => (
                    <tr key={r.name} style={{ borderTop: '1px solid var(--border)' }}>
                      <td className="px-3 py-2 font-mono text-[11px]" style={{ color: 'var(--accent)' }}>{r.name}</td>
                      <td className="px-3 py-2" style={{ color: 'var(--text-2)' }}>{r.tipo}</td>
                      <td className="px-3 py-2" style={{ color: 'var(--text-2)' }}>{r.scopo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>5. Funzionalità AI e monitoraggio errori (richiede consenso)</h2>
            <p className="mb-3">Queste funzionalità sono <strong>disattivate per default</strong> e si attivano solo dopo il tuo consenso esplicito tramite il banner cookie.</p>

            <div className="space-y-3">
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Funzionalità AI <span className="text-xs ml-2 px-2 py-0.5 rounded" style={{ background: 'var(--bg-s)', color: 'var(--accent)' }}>ai_processing</span></p>
                <p className="mb-2">
                  Quando attive consentono le seguenti elaborazioni:
                </p>
                <ul className="space-y-1 list-disc list-inside text-xs">
                  <li><strong style={{ color: 'var(--text-2)' }}>Anthropic Claude</strong> — analisi anti-bias delle notizie, generazione dell&apos;Articolo Consolidato Veritas</li>
                  <li><strong style={{ color: 'var(--text-2)' }}>Google Gemini</strong> — sintesi vocale degli articoli tramite AudioReader</li>
                </ul>
                <p className="text-xs mt-2" style={{ color: 'var(--text-3)' }}>
                  Senza il tuo consenso, l&apos;AudioReader resta disabilitato. Le query inviate a queste API includono il testo dell&apos;articolo o la tua ricerca, e sono soggette alle privacy policy dei rispettivi fornitori (USA).
                </p>
              </div>

              <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Monitoraggio errori <span className="text-xs ml-2 px-2 py-0.5 rounded" style={{ background: 'var(--bg-s)', color: 'var(--accent)' }}>analytics</span></p>
                <p className="mb-2">
                  Quando attive permettono il caricamento di Sentry, uno strumento di error tracking che invia ai propri server (USA) dati tecnici sugli errori JavaScript: stack trace, URL della pagina, tipo di browser e versione, eventuali messaggi di errore.
                </p>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                  <strong>Stato attuale:</strong> Sentry è dichiarato nella Cookie Policy ma non è ancora attivo sul sito. Il consenso preventivo è raccolto in anticipo per quando verrà attivato.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>6. Cookie di terze parti</h2>
            <p className="mb-2">Quando accedi tramite Google o Facebook, i rispettivi provider impostano i propri cookie durante il flusso di autenticazione. Tali cookie sono fuori dal nostro controllo e regolati dalle loro privacy policy:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>Google Privacy Policy ↗</a></li>
              <li><a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>Meta / Facebook Privacy Policy ↗</a></li>
              <li><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>Supabase Privacy Policy ↗</a> (sessione di autenticazione)</li>
            </ul>
            <p className="mt-3">
              <strong style={{ color: 'var(--text)' }}>Cookie di tracciamento:</strong> Lens Veritas <strong>non utilizza</strong> Google Analytics, Google Tag Manager, Meta Pixel, Hotjar, Mixpanel, Plausible o altre piattaforme di tracking e profilazione.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>7. Gestione del consenso</h2>
            <p className="mb-3">
              Puoi modificare o revocare il tuo consenso in qualsiasi momento riaprendo il banner cookie:
            </p>
            <ReopenConsentLink />
            <p className="text-xs mt-3" style={{ color: 'var(--text-3)' }}>
              In alternativa puoi gestire i cookie direttamente dalle impostazioni del tuo browser. La disabilitazione dei cookie tecnici può compromettere il funzionamento del sito (es. impossibilità di mantenere la sessione di login).
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-3)' }}>
              Per esercitare i tuoi diritti GDPR (accesso, rettifica, cancellazione, portabilità, opposizione) scrivi a{' '}
              <a href="mailto:paolo_fantinel@hotmail.com" className="underline" style={{ color: 'var(--accent)' }}>paolo_fantinel@hotmail.com</a>{' '}
              o consulta la <a href="/privacy" className="underline" style={{ color: 'var(--accent)' }}>Privacy Policy completa</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>8. Registro dei consensi</h2>
            <p>
              Ai sensi dell&apos;art. 7(1) GDPR (onere della prova) registriamo le tue scelte di consenso su Supabase nella tabella <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'var(--bg-card)' }}>consent_log</code>. Il registro include un identificativo di sessione anonimo, le categorie accettate e rifiutate, la versione della policy al momento del consenso, e il tuo indirizzo IP. L&apos;IP viene anonimizzato automaticamente dopo 12 mesi.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>9. Aggiornamenti</h2>
            <p>
              Eventuali modifiche a questa policy verranno pubblicate su questa pagina con nuova data di revisione. Se le modifiche riguardano categorie con consenso, ti chiederemo nuovamente il consenso aggiornato tramite il banner.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>10. Contatti</h2>
            <p>
              Per qualsiasi questione relativa ai cookie scrivi a{' '}
              <a href="mailto:paolo_fantinel@hotmail.com" className="underline" style={{ color: 'var(--accent)' }}>paolo_fantinel@hotmail.com</a>.
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
