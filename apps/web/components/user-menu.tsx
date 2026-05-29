'use client'

import { useState } from 'react'
import { useAuth } from './auth-provider'
import AuthModal from './auth-modal'
import { isSupabaseConfigured } from '../lib/supabase-client'
import { IconUser, IconSearch, IconBook } from './icons'

export default function UserMenu() {
  const { user, loading, signOut } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // Supabase non configurato — nascondi il menu
  if (!isSupabaseConfigured()) return null

  // Durante caricamento sessione mostra già il bottone Accedi
  if (loading) return (
    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold opacity-50"
      style={{ background: 'var(--accent)', color: '#000' }}>
      Accedi
    </button>
  )

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
              onClick={() => { signOut(); setShowDropdown(false) }}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm w-full text-left transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-3)' }}>
              <span>→</span> Esci
            </button>
          </div>
        </>
      )}
    </div>
  )
}
