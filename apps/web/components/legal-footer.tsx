'use client'
import Link from 'next/link'
import { useConsent } from '../lib/use-consent'

export default function LegalFooter() {
  const { reopen } = useConsent()

  return (
    <footer
      className="w-full py-4 px-4 text-center text-xs hidden lg:block"
      style={{ borderTop: '1px solid var(--border)', color: 'var(--text-3)' }}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <span>© {new Date().getFullYear()} Lens Veritas</span>
        <span style={{ color: 'var(--border)' }}>·</span>
        <Link href="/privacy" className="hover:underline hover:opacity-80">Privacy Policy</Link>
        <Link href="/terms" className="hover:underline hover:opacity-80">Termini di Servizio</Link>
        <Link href="/copyright" className="hover:underline hover:opacity-80">Copyright</Link>
        <span style={{ color: 'var(--border)' }}>·</span>
        <button
          onClick={reopen}
          className="hover:underline hover:opacity-80 cursor-pointer"
        >
          Gestisci consensi
        </button>
      </div>
    </footer>
  )
}
