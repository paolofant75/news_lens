import PageLayout from '../../components/page-layout'
import ConsentReopenButton from '../../components/consent-reopen-button'

export const metadata = {
  title: 'Cookie Policy — Lens Veritas',
  description: 'Informativa estesa sui cookie e tecnologie di tracciamento utilizzate da Lens Veritas',
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

        {/* Banner versione multilingua (richiesto dagli scanner di compliance) */}
        <div
          className="mb-8 rounded-lg p-3 text-xs flex items-center justify-between gap-3"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
        >
          <span>Questo documento è disponibile anche in inglese.</span>
          <a href="/en/cookie-policy" className="underline shrink-0 hover:opacity-80" style={{ color: 'var(--accent)' }}>
            English version →
          </a>
        </div>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>1. Cosa sono i cookie</h2>
            <p>
              I cookie sono piccoli file di testo che i siti web salvano sul dispositivo dell&apos;utente per memorizzare informazioni utili al funzionamento o all&apos;esperienza di navigazione. Insieme ai cookie, esistono tecnologie analoghe come <strong>localStorage</strong>, <strong>sessionStorage</strong> e <strong>fingerprinting</strong> che svolgono funzioni simili. Questa policy le tratta come equivalenti dal punto di vista normativo.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>2. Tipi di cookie utilizzati</h2>
            <div className="space-y-2">
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>Cookie tecnici necessari</p>
                <p>Non richiedono consenso ai sensi dell&apos;art. 122 D.Lgs. 196/2003. Indispensabili al funzionamento del sito (sessione, lingua, registro consensi).</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>Cookie analitici / di monitoraggio</p>
                <p>Richiedono il consenso esplicito dell&apos;utente. Attualmente disattivati per default (Sentry per error tracking, attivabile su consenso).</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <p className="font-medium mb-1 text-green-400">Cookie di profilazione / marketing</p>
                <p><strong>NON utilizzati da Lens Veritas.</strong> Nessun retargeting, nessun pixel pubblicitario, nessun social plugin con tracker.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>3. Elenco completo cookie tecnici proprietari</h2>
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
                    { name: 'nlv_lang', tipo: 'Cookie HTTP', durata: '365 giorni', scopo: 'Lingua dell\'interfaccia' },
                    { name: 'nlv_palette', tipo: 'Cookie HTTP', durata: '365 giorni', scopo: 'Tema grafico (Noir / Bureau)' },
                    { name: 'nlv_font', tipo: 'Cookie HTTP', durata: '365 giorni', scopo: 'Famiglia di font' },
                    { name: 'nlv_ai_consent', tipo: 'Cookie HTTP', durata: '365 giorni', scopo: 'Mirror server del consenso "Funzionalità AI" (necessario per gate dell\'analisi Veritas)' },
                    { name: 'sb-<project>-auth-token', tipo: 'Cookie HTTP (Supabase)', durata: 'Sessione', scopo: 'Autenticazione utente (solo se registrato)' },
                    { name: 'nlv_consent_v2', tipo: 'localStorage', durata: '6 mesi', scopo: 'Memorizza scelta consensi cookie' },
                    { name: 'nlv_session_id', tipo: 'localStorage', durata: 'Persistente', scopo: 'Identificativo sessione anonimo (UUID) per registro consensi' },
                    { name: 'nlv_layout', tipo: 'localStorage', durata: 'Persistente', scopo: 'Preferenza layout articoli (griglia / lista)' },
                    { name: 'nlv_accent_<palette>', tipo: 'localStorage', durata: 'Persistente', scopo: 'Colore accent custom per palette' },
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
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>4. Cookie e tracker di terze parti</h2>
            <p className="mb-3">Servizi terzi che processano dati per finalità tecniche o funzionali. I servizi marcati con consenso vengono attivati solo dopo l&apos;accettazione esplicita nel banner cookie.</p>
            <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
              <table className="w-full text-xs">
                <thead style={{ background: 'var(--bg-card)' }}>
                  <tr>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--text)' }}>Servizio</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--text)' }}>Categoria</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--text)' }}>Finalità</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--text)' }}>Privacy</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Vercel', cat: 'Tecnico', scopo: 'Hosting, log IP/UA per sicurezza', link: 'https://vercel.com/legal/privacy-policy' },
                    { name: 'Supabase', cat: 'Tecnico (auth)', scopo: 'Autenticazione e database utenti', link: 'https://supabase.com/privacy' },
                    { name: 'Upstash Redis', cat: 'Tecnico (cache)', scopo: 'Cache articoli (TTL ~3 minuti)', link: 'https://upstash.com/trust/privacy.pdf' },
                    { name: 'Google OAuth', cat: 'Tecnico (login)', scopo: 'Accesso con account Google (opzionale)', link: 'https://policies.google.com/privacy' },
                    { name: 'Meta / Facebook OAuth', cat: 'Tecnico (login)', scopo: 'Accesso con account Facebook (opzionale)', link: 'https://www.facebook.com/privacy/policy' },
                    { name: 'DeepSeek', cat: 'AI Processing', scopo: 'Analisi Veritas + traduzioni (provider primario)', link: 'https://platform.deepseek.com/privacy' },
                    { name: 'Anthropic (Claude API)', cat: 'AI Processing', scopo: 'Analisi anti-bias notizie (fallback se DeepSeek non disponibile)', link: 'https://www.anthropic.com/legal/privacy' },
                    { name: 'Google (Gemini API)', cat: 'AI Processing', scopo: 'Sintesi vocale articoli su richiesta', link: 'https://policies.google.com/privacy' },
                    { name: 'Sentry', cat: 'Analytics', scopo: 'Monitoraggio errori (non ancora attivo)', link: 'https://sentry.io/privacy/' },
                    { name: 'NewsAPI / GNews / The Guardian / GDELT', cat: 'Tecnico (server-side)', scopo: 'Fonte articoli — solo query server, nessun cookie nel browser', link: '#' },
                    { name: 'Replicate', cat: 'Tecnico (server-side)', scopo: 'Generazione immagini AI per social — solo server', link: 'https://replicate.com/privacy' },
                  ].map((r) => (
                    <tr key={r.name} style={{ borderTop: '1px solid var(--border)' }}>
                      <td className="px-3 py-2 font-medium" style={{ color: 'var(--text)' }}>{r.name}</td>
                      <td className="px-3 py-2" style={{ color: 'var(--text-2)' }}>{r.cat}</td>
                      <td className="px-3 py-2" style={{ color: 'var(--text-2)' }}>{r.scopo}</td>
                      <td className="px-3 py-2">
                        {r.link === '#' ? (
                          <span style={{ color: 'var(--text-3)' }}>—</span>
                        ) : (
                          <a href={r.link} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>↗</a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs" style={{ color: 'var(--text-3)' }}>
              Lens Veritas non utilizza Google Analytics, Google Tag Manager, Meta Pixel, Hotjar, Mixpanel, Plausible o altre piattaforme di tracciamento. I font (Geist) sono self-hostati tramite <code>next/font</code> e non comportano richieste a CDN esterni.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>5. Base giuridica del trattamento</h2>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong style={{ color: 'var(--text)' }}>Cookie tecnici</strong> — legittimo interesse del Titolare al corretto funzionamento del servizio (art. 6(1)(f) GDPR)</li>
              <li><strong style={{ color: 'var(--text)' }}>Cookie analitici / AI</strong> — consenso espresso dell&apos;utente (art. 6(1)(a) GDPR), prestato tramite il banner cookie</li>
              <li><strong style={{ color: 'var(--text)' }}>Cookie di autenticazione</strong> — esecuzione del contratto con l&apos;utente registrato (art. 6(1)(b) GDPR)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>6. Durata del consenso</h2>
            <p>
              Il consenso prestato ha durata di <strong>6 mesi</strong>. Allo scadere ti verrà richiesto nuovamente. Puoi modificare o revocare il consenso in qualsiasi momento tramite il pulsante &quot;Modifica preferenze cookie&quot; presente nel footer del sito o riaprendo qui sotto il banner:
            </p>
            <div className="mt-3">
              <ConsentReopenButton label="Modifica preferenze cookie" />
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>7. Come gestire i cookie</h2>
            <p className="mb-2">Puoi gestire i tuoi cookie in due modi:</p>
            <ol className="space-y-1 list-decimal list-inside mb-3">
              <li>Tramite il pulsante <strong>&quot;Gestisci consensi&quot;</strong> presente nel footer del sito (modifica solo le tue scelte su Lens Veritas)</li>
              <li>Dalle <strong>impostazioni del browser</strong> (elimina cookie già salvati, blocca cookie futuri di tutti i siti):</li>
            </ol>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>Google Chrome ↗</a></li>
              <li><a href="https://support.mozilla.org/it/kb/protezione-antitracciamento-avanzata-firefox-desktop" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>Mozilla Firefox ↗</a></li>
              <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>Apple Safari ↗</a></li>
              <li><a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>Microsoft Edge ↗</a></li>
            </ul>
            <div className="rounded-xl p-4 mt-3" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)' }}>
              <p className="text-xs" style={{ color: 'var(--text-2)' }}>
                ⚠ La disabilitazione dei cookie tecnici può comportare il malfunzionamento di alcune parti del sito (es. mantenimento della sessione di login).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>8. Registro dei consensi</h2>
            <p>
              Ogni consenso prestato viene registrato in un database sicuro (Supabase) contenente: identificativo sessione, categorie accettate/rifiutate, timestamp, indirizzo IP (anonimizzato dopo 12 mesi) e versione della policy. Questo registro è conservato come prova del consenso ai sensi dell&apos;art. 7(1) GDPR. Puoi richiedere l&apos;accesso, la rettifica o la cancellazione di queste informazioni scrivendo a{' '}
              <a href="mailto:paolo_fantinel@hotmail.com" className="underline" style={{ color: 'var(--accent)' }}>paolo_fantinel@hotmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>9. Modifiche alla Cookie Policy</h2>
            <p>
              Eventuali modifiche significative comporteranno una nuova richiesta di consenso al successivo accesso. La data di ultima modifica è indicata in alto in questa pagina.
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
