'use client'
import Link from 'next/link'
import { useAuth } from './auth-provider'

const ADMIN_EMAIL = 'fantinel.paolo@gmail.com'

export default function LegalFooter() {
  const year = new Date().getFullYear()
  const { user } = useAuth()
  const isAdmin = user?.email === ADMIN_EMAIL

  const openCookiePrefs = () => {
    window.dispatchEvent(new CustomEvent('consent:reopen'))
  }

  return (
    <footer
      className="mt-16 py-8 px-4 pb-24 lg:pb-8 text-xs"
      style={{ borderTop: '1px solid var(--border)', color: 'var(--text-3)' }}
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span style={{ color: 'var(--text-2)' }}>© {year} Lens Veritas</span>
            <span className="opacity-50">·</span>
            <span>News, refracted.</span>
          </div>
          <nav aria-label="Documenti legali" className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/privacy" className="hover:opacity-80 underline-offset-2 hover:underline">Privacy Policy</Link>
            <Link href="/cookie-policy" className="hover:opacity-80 underline-offset-2 hover:underline">Cookie Policy</Link>
            <Link href="/terms" className="hover:opacity-80 underline-offset-2 hover:underline">Termini di Servizio</Link>
            <Link href="/copyright" className="hover:opacity-80 underline-offset-2 hover:underline">Copyright</Link>
            <Link href="/privacy/elimina-dati" className="hover:opacity-80 underline-offset-2 hover:underline">Elimina dati</Link>
            <button
              onClick={openCookiePrefs}
              className="hover:opacity-80 underline-offset-2 hover:underline cursor-pointer"
              style={{ color: 'inherit', background: 'transparent', padding: 0, border: 'none', font: 'inherit' }}
            >
              Preferenze cookie
            </button>
            <a href="mailto:paolo_fantinel@hotmail.com" className="hover:opacity-80 underline-offset-2 hover:underline">Contatti</a>
            {isAdmin && (
              <Link href="/admin" className="hover:opacity-80 underline-offset-2 hover:underline" style={{ color: 'var(--accent)' }}>
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="mt-4 text-[10px] opacity-70 leading-relaxed">
          Lens Veritas aggrega notizie da fonti pubbliche di terzi nei limiti del diritto di citazione (art. 70 L. 633/1941) e dell&apos;eccezione di cronaca (art. 65). Le sintesi e le analisi &laquo;Veritas&raquo; sono generate da intelligenza artificiale (Claude di Anthropic, Gemini di Google) ai sensi dell&apos;art. 50 EU AI Act (Reg. UE 2024/1689) e devono essere verificate presso le fonti originali linkate. Per richieste di rimozione contenuti vedi{' '}
          <Link href="/copyright" className="underline">/copyright</Link>.
        </div>

        {/* Selettore lingua documenti legali — visibile agli scanner di compliance */}
        <div className="mt-3 flex items-center gap-3 text-[10px]" style={{ color: 'var(--text-3)' }}>
          <span className="opacity-70">Lingua documenti legali / Legal documents language:</span>
          <Link href="/privacy" hrefLang="it" className="hover:opacity-80 underline-offset-2 hover:underline">IT</Link>
          <span className="opacity-50">·</span>
          <Link href="/en/privacy" hrefLang="en" className="hover:opacity-80 underline-offset-2 hover:underline">EN</Link>
        </div>
      </div>
    </footer>
  )
}
