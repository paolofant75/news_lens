'use client'

import { useState } from 'react'
import { getSupabaseClient } from '../lib/supabase-client'
import { COUNTRIES } from '../lib/countries'
import { IconClose } from './icons'

type Mode = 'login' | 'register'
const G7_CODES = ['US', 'CA', 'GB', 'FR', 'DE', 'IT', 'JP']

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode]     = useState<Mode>('login')
  const [email, setEmail]   = useState('')
  const [pass, setPass]     = useState('')
  const [name, setName]     = useState('')
  const [country, setCountry] = useState('IT')
  const [error, setError]   = useState('')
  const [ok, setOk]         = useState('')
  const [busy, setBusy]     = useState(false)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const sb = getSupabaseClient()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError(''); setOk('')
    try {
      if (mode === 'register') {
        const { data, error: err } = await sb.auth.signUp({
          email, password: pass,
          options: { data: { full_name: name } },
        })
        if (err) throw err

        // Save country to user_preferences
        if (data.user?.id) {
          const session = await sb.auth.getSession()
          const token = session.data.session?.access_token
          if (token) {
            await fetch('/api/user/preferences', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ country }),
            })
          }
        }

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
        <button onClick={onClose} className="absolute top-4 right-4 opacity-50 hover:opacity-100" style={{ color: 'var(--text)' }} aria-label="Chiudi"><IconClose size={18} /></button>

        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
          {mode === 'login' ? 'Accedi' : 'Crea account'}
        </h2>
        <p className="text-xs mb-6" style={{ color: 'var(--text-3)' }}>
          {mode === 'login' ? 'Benvenuto su Veritas Lens' : 'Registrati per salvare preferenze e cronologia'}
        </p>

        {/* Social login buttons */}
        <div className="flex gap-2 mb-4">
          {/* Google */}
          <button
            onClick={async () => {
              setBusy(true); setError('')
              const { error: err } = await sb.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/auth/callback` },
              })
              if (err) { setError(err.message); setBusy(false) }
            }}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: 'var(--bg-s)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

          {/* Facebook/Meta */}
          <button
            onClick={async () => {
              setBusy(true); setError('')
              const { error: err } = await sb.auth.signInWithOAuth({
                provider: 'facebook',
                options: { redirectTo: `${window.location.origin}/auth/callback` },
              })
              if (err) { setError(err.message); setBusy(false) }
            }}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: 'var(--bg-s)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>oppure</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

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

          {mode === 'register' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium" style={{ color: 'var(--text-2)' }}>Paese</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-left focus:outline-none flex items-center justify-between"
                  style={{ background: 'var(--bg-s)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  {COUNTRIES.find(c => c.code === country)?.nameIt || 'Seleziona paese'}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--text-3)' }}>
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>

                {showCountryDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg border z-50 max-h-48 overflow-y-auto"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="p-2 space-y-1">
                      <p className="text-xs font-semibold px-2 py-1" style={{ color: 'var(--text-2)' }}>G7</p>
                      {G7_CODES.map(code => {
                        const c = COUNTRIES.find(x => x.code === code)
                        return (
                          <button
                            key={code}
                            type="button"
                            onClick={() => {
                              setCountry(code)
                              setShowCountryDropdown(false)
                            }}
                            style={country === code ? { background: 'var(--accent)', color: '#fff' } : { color: 'var(--text)' }}
                            className="w-full px-3 py-2 rounded-lg text-sm text-left hover:opacity-80"
                          >
                            {c?.nameIt}
                          </button>
                        )
                      })}
                      <div className="border-t my-2" style={{ borderColor: 'var(--border)' }}></div>
                      <p className="text-xs font-semibold px-2 py-1" style={{ color: 'var(--text-2)' }}>Tutti i paesi</p>
                      {COUNTRIES.filter(c => !G7_CODES.includes(c.code)).slice(0, 20).map(c => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setCountry(c.code)
                            setShowCountryDropdown(false)
                          }}
                          style={country === c.code ? { background: 'var(--accent)', color: '#fff' } : { color: 'var(--text)' }}
                          className="w-full px-3 py-2 rounded-lg text-sm text-left hover:opacity-80"
                        >
                          {c.nameIt}
                        </button>
                      ))}
                      {COUNTRIES.length > 27 && (
                        <p className="text-xs px-3 py-2" style={{ color: 'var(--text-3)' }}>... e {COUNTRIES.length - 27} altri paesi</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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

        <p className="mt-3 text-[10px] text-center" style={{ color: 'var(--text-3)' }}>
          Registrandoti accetti la nostra{' '}
          <a href="/privacy" target="_blank" className="underline hover:opacity-80" style={{ color: 'var(--text-3)' }}>
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
