'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSupabaseClient } from '../../../lib/supabase-client'
import Link from 'next/link'
import { IconLink } from '../../../components/icons'

export default function AuthCallbackPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) { setStatus('error'); return }

    // Supabase scambia automaticamente il token dall'URL
    const sb = getSupabaseClient()
    sb.auth.getSession().then(({ data }) => {
      setStatus(data.session ? 'ok' : 'error')
    })
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-md w-full text-center">

        {status === 'loading' && (
          <div>
            <div className="w-12 h-12 rounded-full mx-auto mb-4 animate-pulse" style={{ background: 'var(--accent)' }} />
            <p style={{ color: 'var(--text-3)' }}>Verifica in corso…</p>
          </div>
        )}

        {status === 'ok' && (
          <div>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-black"
              style={{ background: 'var(--accent)' }}>
              V
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
              Benvenuto su Veritas Lens!
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--text-2)' }}>
              Il tuo account è stato confermato. Ora puoi accedere alle notizie e salvare le tue preferenze.
            </p>
            <Link href="/news"
              className="inline-block px-8 py-3 rounded-xl font-semibold text-sm text-black transition-opacity hover:opacity-80"
              style={{ background: 'var(--accent)' }}>
              Vai alle notizie →
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="flex justify-center mb-4" style={{ color: 'var(--text-3)' }}>
              <IconLink size={36} />
            </div>
            <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
              Link scaduto o non valido
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-2)' }}>
              Il link di conferma è scaduto (valido 24h). Prova ad accedere — se il tuo account è già attivo funzionerà direttamente.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/news"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ background: 'var(--bg-s)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                Vai alle notizie
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
