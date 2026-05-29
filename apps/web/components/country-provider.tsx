'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './auth-provider'
import { getSupabaseClient } from '../lib/supabase-client'

type CountryCtx = {
  country: string
  setTempCountry: (code: string) => void
  loading: boolean
}

const Ctx = createContext<CountryCtx>({ country: 'IT', setTempCountry: () => {}, loading: true })

export function CountryProvider({ children, initialCountry = 'IT' }: { children: ReactNode; initialCountry?: string }) {
  const [country, setCountry] = useState(initialCountry)
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return

    const loadCountry = async () => {
      if (user) {
        try {
          const sb = getSupabaseClient()
          const { data, error } = await sb
            .from('user_preferences')
            .select('country')
            .eq('user_id', user.id)
            .single() as { data: { country?: string } | null; error: unknown }

          const code = (!error && data?.country) ? data.country : 'IT'
          setCountry(code)

          // Salva il paese in un cookie per il server component
          await fetch('/api/lang', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country: code }),
          }).catch(() => {})
        } catch {
          setCountry('IT')
        }
      } else {
        const temp = localStorage.getItem('nlv_temp_country') ?? 'IT'
        setCountry(temp)
      }
      setLoading(false)
    }

    loadCountry()
  }, [user, authLoading])

  function setTempCountry(code: string) {
    const normalized = code.toUpperCase()
    if (!user) {
      localStorage.setItem('nlv_temp_country', normalized)
      setCountry(normalized)
    }
  }

  return <Ctx.Provider value={{ country, setTempCountry, loading }}>{children}</Ctx.Provider>
}

export const useCountry = () => useContext(Ctx)
