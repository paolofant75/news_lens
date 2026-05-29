'use client'

import { useState } from 'react'
import { useAuth } from './auth-provider'
import { useCountry } from './country-provider'
import AuthModal from './auth-modal'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase-client'
import { COUNTRIES } from '../lib/countries'
import { IconUser, IconSearch, IconBook } from './icons'

const G7_CODES = ['US', 'CA', 'GB', 'FR', 'DE', 'IT', 'JP']

export default function UserMenu() {
  const { user, loading, signOut } = useAuth()
  const { country: userCountry, loading: countryLoading } = useCountry()
  const [showModal, setShowModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showCountryModal, setShowCountryModal] = useState(false)
  const [newCountry, setNewCountry] = useState(userCountry)
  const [countryChangeBusy, setCountryChangeBusy] = useState(false)
  const [countryChangeError, setCountryChangeError] = useState('')

  // Supabase non configurato — nascondi il menu
  if (!isSupabaseConfigured()) return null

  // Durante caricamento sessione mostra già il bottone Accedi
  if (loading) return (
    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold opacity-50"
      style={{ background: 'var(--accent)', color: '#000' }}>
      Accedi
    </button>
  )

  async function handleCountryChange() {
    setCountryChangeBusy(true)
    setCountryChangeError('')
    try {
      const sb = getSupabaseClient()
      const session = await sb.auth.getSession()
      const token = session.data.session?.access_token

      if (!token) throw new Error('No session')

      const res = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ country: newCountry }),
      })

      if (!res.ok) throw new Error('Failed to update country')

      // Salva il paese nel cookie per il server component
      document.cookie = `nlv_country=${newCountry}; path=/; max-age=${365 * 24 * 60 * 60}`

      setShowCountryModal(false)
      setShowDropdown(false)

      // Ricarica la pagina per applicare il nuovo boost del paese
      window.location.href = '/news'
    } catch (err) {
      setCountryChangeError(err instanceof Error ? err.message : 'Errore')
    } finally {
      setCountryChangeBusy(false)
    }
  }

  if (!user) return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
        style={{ background: 'var(--accent)', color: '#000' }}
      >
        Accedi
      </button>
      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  )

  const initials = (user.user_metadata?.full_name as string | undefined)
    ?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    ?? user.email?.slice(0, 2).toUpperCase()
    ?? 'U'

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(o => !o)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black transition-opacity hover:opacity-80"
        style={{ background: 'var(--accent)' }}
      >
        {initials}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div
            className="absolute right-0 top-10 z-50 w-52 rounded-xl py-2 shadow-xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-[10px] truncate" style={{ color: 'var(--text-3)' }}>{user.email}</p>
            </div>

            <a href="/profilo" onClick={() => setShowDropdown(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-2)' }}>
              <IconUser size={14} /> Il mio profilo
            </a>
            <a href="/profilo#ricerche" onClick={() => setShowDropdown(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-2)' }}>
              <IconSearch size={14} /> Cronologia ricerche
            </a>
            <a href="/profilo#letti" onClick={() => setShowDropdown(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-2)' }}>
              <IconBook size={14} /> Articoli letti
            </a>

            <div className="my-1" style={{ borderBottom: '1px solid var(--border)' }} />

            <button
              onClick={() => setShowCountryModal(true)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm w-full text-left transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-2)' }}>
              <span>🌍</span> Paese: {!countryLoading ? COUNTRIES.find(c => c.code === userCountry)?.nameIt : '...'}
            </button>

            <button
              onClick={() => { signOut(); setShowDropdown(false) }}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm w-full text-left transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-3)' }}>
              <span>→</span> Esci
            </button>
          </div>
        </>
      )}

      {showCountryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl p-8 relative" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>Cambia paese</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>
              Cambiare il paese ricaricherà il feed per mostrare contenuti personalizzati per il nuovo paese.
            </p>

            <div className="space-y-2 mb-4">
              <p className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>G7 - Accesso rapido</p>
              <div className="grid grid-cols-2 gap-2">
                {G7_CODES.map(code => {
                  const c = COUNTRIES.find(x => x.code === code)
                  return (
                    <button
                      key={code}
                      onClick={() => setNewCountry(code)}
                      style={newCountry === code
                        ? { background: 'var(--accent)', color: '#fff' }
                        : {
                          background: 'var(--bg-s)',
                          color: 'var(--text-2)',
                          border: '1px solid var(--border)',
                        }}
                      className="px-2 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                    >
                      {c?.nameIt}
                    </button>
                  )
                })}
              </div>

              <div className="border-t pt-2" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Tutti i paesi</p>
                <select
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border"
                  style={{
                    background: 'var(--bg-s)',
                    color: 'var(--text)',
                    borderColor: 'var(--border)',
                  }}
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.nameIt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {countryChangeError && (
              <p className="text-xs text-red-400 mb-4">{countryChangeError}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowCountryModal(false)}
                disabled={countryChangeBusy}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ background: 'var(--bg-s)', color: 'var(--text)', border: '1px solid var(--border)' }}
              >
                Annulla
              </button>
              <button
                onClick={handleCountryChange}
                disabled={countryChangeBusy || newCountry === userCountry}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-black transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ background: 'var(--accent)' }}
              >
                {countryChangeBusy ? '...' : 'Salva'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
