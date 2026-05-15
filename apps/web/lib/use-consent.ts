'use client'
import { useEffect, useState } from 'react'

export type ConsentCategory = 'technical' | 'analytics' | 'ai_processing'

export function useConsent() {
  const [accepted, setAccepted] = useState<ConsentCategory[]>(['technical'])

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem('nlv_consent_v2')
        if (raw) {
          const parsed = JSON.parse(raw) as { acceptedCategories?: ConsentCategory[] }
          setAccepted(parsed.acceptedCategories ?? ['technical'])
        }
      } catch {
        // ignore malformed storage
      }
    }
    read()
    window.addEventListener('consent:change', read)
    return () => window.removeEventListener('consent:change', read)
  }, [])

  const has = (cat: ConsentCategory) => accepted.includes(cat)

  const reopen = () => {
    window.dispatchEvent(new CustomEvent('consent:reopen'))
  }

  return { accepted, has, reopen }
}
