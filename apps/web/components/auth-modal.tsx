'use client'

import { useState } from 'react'
import { getSupabaseClient } from '../lib/supabase-client'

type Mode = 'login' | 'register'

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode]     = useState<Mode>('login')
  const [email, setEmail]   = useState('')
  const [pass, setPass]     = useState('')
  const [name, setName]     = useState('')
  const [error, setError]   = useState('')
  const [ok, setOk]         = useState('')
  const [busy, setBusy]     = useState(false)
  const sb = getSupabaseClient()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError(''); setOk('')
    try {
      if (mode === 'register') {
        const { error: err } = await sb.auth.signUp({
          email, password: pass,
          options: { data: { full_name: name } },
        })
        if (err) throw err
        setOk('Controlla la tua email per confermare la registrazione.')
      } else {
        const { error: err } = await sb.auth.signInWithPassword({ email, password: pass })
        if (err) throw err
        onClose()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-sm rounded-2xl p-8 relative" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-xl opacity-50 hover:opacity-100" style={{ color: 'var(--text)' }}>✕</button>

        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
          {mode === 'login' ? 'Accedi' : 'Crea account'}
        </h2>
        <p className="text-xs mb-6" style={{ color: 'var(--text-3)' }}>
          {mode === 'login' ? 'Benvenuto su Veritas Lens' : 'Registrati per salvare preferenze e cronologia'}
        </p>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome (opzionale)"
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: 'var(--bg-s)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          )}
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
            className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{ background: 'var(--bg-s)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          <input required type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Password"
            className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{ background: 'var(--bg-s)', border: '1px solid var(--border)', color: 'var(--text)' }} />

          {error && <p className="text-xs text-red-400">{error}</p>}
          {ok    && <p className="text-xs text-green-400">{ok}</p>}

          <button type="submit" disabled={busy}
            className="w-full py-2.5 rounded-xl font-semibold text-sm text-black disabled:opacity-50 transition-opacity hover:opacity-80"
            style={{ background: 'var(--accent)' }}>
            {busy ? '...' : mode === 'login' ? 'Accedi' : 'Registrati'}
          </button>
        </form>

        <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setOk('') }}
          className="mt-4 text-xs w-full text-center hover:opacity-80" style={{ color: 'var(--text-3)' }}>
          {mode === 'login' ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
        </button>
      </div>
    </div>
  )
}
