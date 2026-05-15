'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RefreshFeedButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRefresh() {
    if (loading) return
    setLoading(true)
    try {
      await fetch('/api/refresh-feed', { method: 'POST' })
    } catch {
      // best-effort: anche se la POST fallisce, prova comunque il refresh
    }
    router.refresh()
    // Lascio loading=true qualche istante in piu' per dare feedback visivo
    setTimeout(() => setLoading(false), 400)
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      title="Aggiorna feed notizie"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        color: 'var(--text-2)',
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={loading ? 'animate-spin' : ''}
      >
        <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.7-3" />
        <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.7 3" />
        <polyline points="21 3 21 8 16 8" />
        <polyline points="3 21 3 16 8 16" />
      </svg>
      {loading ? 'Aggiorno…' : 'Aggiorna'}
    </button>
  )
}
