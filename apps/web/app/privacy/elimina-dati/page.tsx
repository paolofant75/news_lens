import PageLayout from '../../../components/page-layout'

export const metadata = {
  title: 'Elimina i tuoi dati — Veritas Lens',
  description: 'Istruzioni per richiedere la cancellazione dei tuoi dati da Veritas Lens',
}

export default function EliminaDatiPage({
  searchParams,
}: {
  searchParams: { id?: string }
}) {
  const confirmationCode = searchParams?.id

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto px-4 py-12">

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
            Eliminazione dei tuoi dati
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            Veritas Lens · news-lens-psi.vercel.app
          </p>
        </div>

        {confirmationCode && (
          <div className="mb-8 rounded-xl p-5" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <p className="text-sm font-semibold text-green-400 mb-1">Richiesta ricevuta</p>
            <p className="text-xs" style={{ color: 'var(--text-2)' }}>
              Codice di conferma: <code className="font-mono">{confirmationCode}</code>
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-3)' }}>
              I tuoi dati verranno eliminati entro 30 giorni.
            </p>
          </div>
        )}

        <div className="space-y-6 text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>

          <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>Cosa conserviamo</h2>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Indirizzo email e nome display (se registrato)</li>
              <li>Cronologia articoli letti (solo utenti registrati)</li>
              <li>Cronologia ricerche Veritas (solo utenti registrati)</li>
            </ul>
          </div>

          <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>Come eliminare i tuoi dati</h2>

            <div className="space-y-4">
              <div>
                <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>Metodo 1 — Dal tuo profilo</p>
                <ol className="space-y-1 list-decimal list-inside" style={{ color: 'var(--text-2)' }}>
                  <li>Accedi al sito</li>
                  <li>Vai su <a href="/profilo" className="underline" style={{ color: 'var(--accent)' }}>Il mio profilo</a></li>
                  <li>Scorri in fondo e clicca <strong>Elimina account</strong></li>
                </ol>
              </div>

              <div>
                <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>Metodo 2 — Via email</p>
                <p>
                  Scrivi a{' '}
                  <a href="mailto:paolo_fantinel@hotmail.com?subject=Richiesta eliminazione dati Veritas Lens"
                    className="underline" style={{ color: 'var(--accent)' }}>
                    paolo_fantinel@hotmail.com
                  </a>{' '}
                  con oggetto <em>&quot;Richiesta eliminazione dati Veritas Lens&quot;</em> indicando l&apos;email del tuo account. Risponderemo entro 72 ore.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>Cosa succede dopo la richiesta</h2>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>I tuoi dati vengono eliminati entro 30 giorni</li>
              <li>Riceverai una conferma via email</li>
              <li>I dati in cache (articoli) si azzerano automaticamente ogni 3 minuti</li>
              <li>I dati condivisi con Google o Facebook al momento del login sono soggetti alle loro rispettive privacy policy</li>
            </ul>
          </div>

        </div>

        <div className="mt-10 pt-6 flex items-center justify-between text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-3)' }}>
          <a href="/privacy" className="underline hover:opacity-80">← Privacy Policy completa</a>
          <a href="/" className="hover:opacity-80" style={{ color: 'var(--accent)' }}>Home</a>
        </div>

      </div>
    </PageLayout>
  )
}
