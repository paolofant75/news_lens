'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type ConsentCategory = 'technical' | 'analytics' | 'ai_processing'

type ConsentState = {
  version: string
  acceptedCategories: ConsentCategory[]
  rejectedCategories: ConsentCategory[]
  sessionId: string
  timestamp: string
}

const CONSENT_VERSION = '2026-05-15'
const STORAGE_KEY = 'nlv_consent_v2'
const CONSENT_TTL_MS = 1000 * 60 * 60 * 24 * 30 * 6 // 6 mesi

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  const existing = localStorage.getItem('nlv_session_id')
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem('nlv_session_id', id)
  return id
}

function getStoredConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ConsentState
    if (parsed.version !== CONSENT_VERSION) return null
    // Consenso scade dopo 6 mesi → forza rinnovo
    const age = Date.now() - new Date(parsed.timestamp).getTime()
    if (Number.isFinite(age) && age > CONSENT_TTL_MS) return null
    return parsed
  } catch {
    return null
  }
}

async function persistConsent(state: ConsentState, userId?: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent('consent:change', { detail: state }))
  try {
    await fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: state.sessionId,
        acceptedCategories: state.acceptedCategories,
        rejectedCategories: state.rejectedCategories,
        userId,
      }),
    })
  } catch (e) {
    console.warn('[consent] failed to persist server-side:', e)
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [showPrefs, setShowPrefs] = useState(false)
  const [prefs, setPrefs] = useState<Record<ConsentCategory, boolean>>({
    technical: true,
    analytics: false,
    ai_processing: false,
  })

  useEffect(() => {
    const stored = getStoredConsent()
    if (!stored) setVisible(true)

    const handler = () => setVisible(true)
    window.addEventListener('consent:reopen', handler)
    return () => window.removeEventListener('consent:reopen', handler)
  }, [])

  const acceptAll = async () => {
    const state: ConsentState = {
      version: CONSENT_VERSION,
      acceptedCategories: ['technical', 'analytics', 'ai_processing'],
      rejectedCategories: [],
      sessionId: getOrCreateSessionId(),
      timestamp: new Date().toISOString(),
    }
    await persistConsent(state)
    setVisible(false)
  }

  const rejectAll = async () => {
    const state: ConsentState = {
      version: CONSENT_VERSION,
      acceptedCategories: ['technical'],
      rejectedCategories: ['analytics', 'ai_processing'],
      sessionId: getOrCreateSessionId(),
      timestamp: new Date().toISOString(),
    }
    await persistConsent(state)
    setVisible(false)
  }

  const saveCustom = async () => {
    const accepted: ConsentCategory[] = ['technical']
    const rejected: ConsentCategory[] = []
    if (prefs.analytics) accepted.push('analytics')
    else rejected.push('analytics')
    if (prefs.ai_processing) accepted.push('ai_processing')
    else rejected.push('ai_processing')

    const state: ConsentState = {
      version: CONSENT_VERSION,
      acceptedCategories: accepted,
      rejectedCategories: rejected,
      sessionId: getOrCreateSessionId(),
      timestamp: new Date().toISOString(),
    }
    await persistConsent(state)
    setShowPrefs(false)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-14 sm:bottom-0 inset-x-0 z-50 p-4 backdrop-blur-md"
      style={{ background: 'rgba(10,10,10,0.92)', borderTop: '1px solid var(--border)' }}
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
    >
      <div className="max-w-4xl mx-auto">
        {!showPrefs ? (
          <>
            <h2
              id="cookie-banner-title"
              className="text-sm font-semibold mb-2"
              style={{ color: 'var(--text)' }}
            >
              La tua privacy
            </h2>
            <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-2)' }}>
              Lens Veritas utilizza cookie tecnici necessari al funzionamento del sito (sempre
              attivi) e, previo tuo consenso, strumenti di monitoraggio degli errori (Sentry) e
              funzionalità AI (Claude, Gemini) per l&apos;analisi delle notizie. Puoi accettare,
              rifiutare o personalizzare la tua scelta. Maggiori dettagli nella nostra{' '}
              <Link href="/cookie-policy" className="underline" style={{ color: 'var(--accent)' }}>
                Cookie Policy
              </Link>{' '}
              e{' '}
              <Link href="/privacy" className="underline" style={{ color: 'var(--accent)' }}>
                Privacy Policy
              </Link>
              .
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={rejectAll}
                className="py-2.5 px-4 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              >
                Rifiuta tutto
              </button>
              <button
                onClick={() => setShowPrefs(true)}
                className="py-2.5 px-4 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              >
                Personalizza
              </button>
              <button
                onClick={acceptAll}
                className="py-2.5 px-4 rounded-xl text-sm font-semibold text-black transition-opacity hover:opacity-80"
                style={{ background: 'var(--accent)' }}
              >
                Accetta tutto
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
              Preferenze cookie
            </h2>
            <div className="space-y-3 mb-4">
              <PrefRow
                title="Cookie tecnici"
                desc="Necessari al funzionamento (lingua, tema, sessione). Sempre attivi."
                checked={true}
                disabled={true}
                onChange={() => {}}
              />
              <PrefRow
                title="Monitoraggio errori (Sentry)"
                desc="Permette di rilevare errori tecnici e migliorare la stabilità del sito."
                checked={prefs.analytics}
                disabled={false}
                onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
              />
              <PrefRow
                title="Funzionalità AI (Veritas, Audio Reader)"
                desc="Invia le tue query ai modelli Claude (Anthropic) e Gemini (Google) per produrre analisi anti-bias e sintesi vocali. Senza consenso queste funzioni saranno disabilitate."
                checked={prefs.ai_processing}
                disabled={false}
                onChange={(v) => setPrefs((p) => ({ ...p, ai_processing: v }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => setShowPrefs(false)}
                className="py-2.5 px-4 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              >
                Indietro
              </button>
              <button
                onClick={saveCustom}
                className="py-2.5 px-4 rounded-xl text-sm font-semibold text-black transition-opacity hover:opacity-80"
                style={{ background: 'var(--accent)' }}
              >
                Salva preferenze
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PrefRow({
  title,
  desc,
  checked,
  disabled,
  onChange,
}: {
  title: string
  desc: string
  checked: boolean
  disabled: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div
      className="rounded-xl p-3 flex items-start gap-3"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 flex-shrink-0"
        aria-label={title}
      />
      <div>
        <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
          {title}
        </p>
        <p className="text-[11px] leading-snug" style={{ color: 'var(--text-3)' }}>
          {desc}
        </p>
      </div>
    </div>
  )
}
