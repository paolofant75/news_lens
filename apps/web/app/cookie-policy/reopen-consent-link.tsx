'use client'
import { useConsent } from '../../lib/use-consent'

export default function ReopenConsentLink() {
  const { reopen } = useConsent()

  return (
    <button
      onClick={reopen}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
      style={{
        background: 'var(--accent)',
        color: '#000',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      Riapri banner cookie
    </button>
  )
}
