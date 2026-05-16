import PageLayout from '../../components/page-layout'

export const metadata = {
  title: 'Privacy Policy — Veritas Lens',
  description: 'Informativa sulla privacy di Veritas Lens',
}

const LAST_UPDATED = '15 maggio 2026'

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

        {/* Banner versione multilingua (richiesto dagli scanner di compliance) */}
        <div
          className="mb-8 rounded-lg p-3 text-xs flex items-center justify-between gap-3"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
        >
          <span>Questo documento è disponibile anche in inglese.</span>
          <a href="/en/privacy" className="underline shrink-0 hover:opacity-80" style={{ color: 'var(--accent)' }}>
            English version →
          </a>
        </div>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>1. Titolare del trattamento</h2>
            <div className="rounded-xl p-4 mb-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="mb-2"><strong style={{ color: 'var(--text)' }}>Nome:</strong> Paolo Fantinel</p>
              <p className="mb-2"><strong style={{ color: 'var(--text)' }}>Servizio:</strong> Lens Veritas (<a href="https://lensveritas.com" className="underline" style={{ color: 'var(--accent)' }}>lensveritas.com</a>) — gestito a titolo personale e non commerciale</p>
              <p className="mb-2"><strong style={{ color: 'var(--text)' }}>Email di contatto privacy:</strong> <a href="mailto:paolo_fantinel@hotmail.com" className="underline" style={{ color: 'var(--accent)' }}>paolo_fantinel@hotmail.com</a></p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-3)' }}>
                Sede del titolare: Italia. Per richieste relative all&apos;esercizio dei diritti GDPR (artt. 15-22) puoi scrivere all&apos;email indicata sopra: rispondiamo entro 30 giorni come previsto dall&apos;art. 12(3) GDPR.
              </p>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>
              <strong>Responsabile della protezione dei dati (DPO):</strong> non obbligatorio ai sensi dell&apos;art. 37 GDPR (il trattamento non rientra nei casi che richiedono la nomina del DPO). Per qualsiasi questione relativa alla privacy contatta direttamente il titolare all&apos;email sopra.
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
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>3. Base giuridica del trattamento (art. 6 GDPR)</h2>
            <div className="space-y-2">
              {[
                { base: 'Contratto (art. 6(1)(b))', desc: 'Autenticazione e gestione dell\'account utente' },
                { base: 'Consenso (art. 6(1)(a))', desc: 'Cronologia letture e ricerche (attivabile/revocabile dal profilo), cookie di preferenza non tecnici, funzionalità AI e monitoraggio errori' },
                { base: 'Legittimo interesse (art. 6(1)(f))', desc: 'Sicurezza del servizio, prevenzione abusi, miglioramento in forma aggregata e anonima' },
              ].map((r) => (
                <div key={r.base} className="rounded-xl p-3 flex gap-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <span className="font-medium shrink-0" style={{ color: 'var(--text)' }}>{r.base}:</span>
                  <span>{r.desc}</span>
                </div>
              ))}
            </div>
            <p className="mt-3">Non utilizziamo i tuoi dati per pubblicità, profilazione commerciale o vendita a terzi.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>4. Servizi terzi utilizzati</h2>
            <div className="space-y-2">
              {[
                { name: 'Supabase', use: 'Database utenti e autenticazione', link: 'https://supabase.com/privacy' },
                { name: 'Vercel', use: 'Hosting e infrastruttura del sito', link: 'https://vercel.com/legal/privacy-policy' },
                { name: 'Google OAuth', use: 'Login con account Google (opzionale)', link: 'https://policies.google.com/privacy' },
                { name: 'Meta / Facebook', use: 'Login con account Facebook (opzionale)', link: 'https://www.facebook.com/privacy/policy' },
                { name: 'DeepSeek', use: 'Provider AI primario per analisi Veritas e traduzioni', link: 'https://platform.deepseek.com/privacy' },
                { name: 'Anthropic Claude', use: 'Provider AI di fallback (analisi anti-bias, traduzioni)', link: 'https://www.anthropic.com/privacy' },
                { name: 'Google Gemini', use: 'Sintesi vocale degli articoli (Audio Reader)', link: 'https://policies.google.com/privacy' },
                { name: 'Upstash Redis', use: 'Cache temporanea degli articoli (max 3 minuti)', link: 'https://upstash.com/trust/privacy.pdf' },
                { name: 'NewsAPI / GNews / The Guardian API', use: 'Fonte degli articoli di notizie', link: '#' },
                { name: 'GDELT Project', use: 'Fonte di articoli e dati geolocalizzati (pubblico dominio)', link: 'https://www.gdeltproject.org/about.html' },
                { name: 'Replicate', use: 'Generazione immagini AI per contenuti social (Instagram)', link: 'https://replicate.com/privacy' },
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
            <p className="mt-3 text-xs" style={{ color: 'var(--text-3)' }}>
              I font (Geist, Geist Mono) sono self-hostati sul nostro server tramite <code>next/font</code> e non comportano richieste a CDN esterni durante la navigazione.
            </p>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-3)' }}>
              <strong style={{ color: 'var(--text-2)' }}>Infrastruttura sottostante</strong>: l&apos;hosting Vercel può utilizzare servizi infrastrutturali sottostanti (CDN Cloudflare/Fastly, anti-DDoS, log di sicurezza) gestiti dal proprio provider. Tali servizi non hanno accesso a dati personali identificabili degli utenti finali, sono utilizzati per finalità tecniche di consegna del sito (legittimo interesse art. 6(1)(f) GDPR) e sono regolati dalla <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>Privacy Policy di Vercel</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>5. Cookie e archiviazione locale</h2>
            <p className="mb-2 font-medium" style={{ color: 'var(--text)' }}>Cookie tecnici (sempre attivi):</p>
            <ul className="space-y-1 list-disc list-inside mb-3">
              <li><code className="text-xs px-1 py-0.5 rounded" style={{ background: 'var(--bg-card)' }}>nlv_lang</code> — lingua selezionata (365 giorni)</li>
              <li><code className="text-xs px-1 py-0.5 rounded" style={{ background: 'var(--bg-card)' }}>nlv_palette</code> — tema grafico (365 giorni)</li>
              <li><code className="text-xs px-1 py-0.5 rounded" style={{ background: 'var(--bg-card)' }}>nlv_font</code> — preferenza font (365 giorni)</li>
              <li><code className="text-xs px-1 py-0.5 rounded" style={{ background: 'var(--bg-card)' }}>sb-*</code> — sessione di autenticazione Supabase (solo se registrato)</li>
            </ul>
            <p className="mb-2 font-medium" style={{ color: 'var(--text)' }}>localStorage (solo nel tuo browser, mai trasmesso ai server):</p>
            <ul className="space-y-1 list-disc list-inside mb-3">
              <li><code className="text-xs px-1 py-0.5 rounded" style={{ background: 'var(--bg-card)' }}>nlv_consent_v2</code> — registro delle tue scelte di consenso cookie</li>
              <li><code className="text-xs px-1 py-0.5 rounded" style={{ background: 'var(--bg-card)' }}>nlv_session_id</code> — identificativo sessione anonimo per il registro consensi</li>
              <li>Preferenze visive (colore accent, layout griglia/lista)</li>
            </ul>
            <p>Non utilizziamo cookie di tracciamento, analitici o pubblicitari di terze parti senza il tuo consenso esplicito.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>6. Trasferimenti internazionali di dati</h2>
            <p>
              Alcuni sub-processor hanno sede negli USA (Anthropic, Google, Upstash, NewsAPI, Replicate, GDELT). I trasferimenti avvengono sulla base delle Clausole Contrattuali Standard (SCC) adottate dalla Commissione Europea ai sensi dell&apos;art. 46(2)(c) GDPR, o di decisioni di adeguatezza ove applicabili.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>7. Conservazione dei dati</h2>
            <div className="space-y-2">
              {[
                { tipo: 'Dati account (email, nome)', periodo: 'Fino alla cancellazione dell\'account' },
                { tipo: 'Cronologia letture e ricerche', periodo: 'Fino alla cancellazione dell\'account o su richiesta' },
                { tipo: 'Registro consensi (IP anonimizzato)', periodo: '12 mesi (IP rimosso dopo 12 mesi, record mantenuto per obbligo legale)' },
                { tipo: 'Cache articoli (Redis)', periodo: 'Massimo 3 minuti' },
              ].map((r) => (
                <div key={r.tipo} className="flex justify-between gap-4 py-2 text-xs" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text)' }}>{r.tipo}</span>
                  <span className="text-right">{r.periodo}</span>
                </div>
              ))}
            </div>
            <p className="mt-3">
              Puoi richiedere la cancellazione anticipata in qualsiasi momento dalla pagina <a href="/privacy/elimina-dati" className="underline" style={{ color: 'var(--accent)' }}>Elimina i tuoi dati</a> o scrivendo a <a href="mailto:paolo_fantinel@hotmail.com" className="underline" style={{ color: 'var(--accent)' }}>paolo_fantinel@hotmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>8. I tuoi diritti (GDPR)</h2>
            <p className="mb-2">Se sei residente nell&apos;Unione Europea, hai diritto a:</p>
            <ul className="space-y-1 list-disc list-inside mb-3">
              <li>Accedere ai tuoi dati personali (art. 15)</li>
              <li>Richiedere la rettifica (art. 16) o la cancellazione (art. 17)</li>
              <li>Limitare od opporti al trattamento (artt. 18-21)</li>
              <li>Richiedere la portabilità dei dati (art. 20)</li>
              <li>Revocare il consenso in qualsiasi momento, senza pregiudicare la liceità del trattamento precedente (art. 7(3))</li>
            </ul>
            <p className="mb-2">
              Per esercitare questi diritti scrivi a <a href="mailto:paolo_fantinel@hotmail.com" className="underline" style={{ color: 'var(--accent)' }}>paolo_fantinel@hotmail.com</a>.
            </p>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-3)' }}>
              Hai inoltre il diritto di proporre reclamo al <strong>Garante per la Protezione dei Dati Personali</strong> (www.garanteprivacy.it), Piazza Venezia 11, 00187 Roma.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>9. Modifiche a questa policy</h2>
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
