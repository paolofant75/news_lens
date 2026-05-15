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
    <>
      {/* Overlay che oscura e blocca l'interazione col sito */}
      <div
        className="fixed inset-0 z-[60]"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        aria-hidden="true"
      />

      {/* Banner ad alto contrasto centrato */}
      <div
        className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-[70] p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-banner-title"
      >
        <div
          className="w-full max-w-2xl mx-auto rounded-2xl p-6 sm:p-7 shadow-2xl"
          style={{ background: '#ffffff', color: '#000000', border: '2px solid #dc2626' }}
        >
          {!showPrefs ? (
            <>
              <h2
                id="cookie-banner-title"
                className="text-xl font-bold mb-3"
                style={{ color: '#000000' }}
              >
                La tua privacy è importante
              </h2>
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#1a1a1a' }}>
                Lens Veritas utilizza cookie tecnici necessari al funzionamento del sito
                (sempre attivi) e, previo tuo consenso, strumenti di monitoraggio degli errori
                (Sentry) e funzionalità AI (DeepSeek o Anthropic Claude per analisi anti-bias
                delle notizie e traduzioni, Google Gemini per la sintesi vocale). Puoi accettare,
                rifiutare o personalizzare la tua scelta. Maggiori dettagli nella nostra{' '}
                <Link href="/cookie-policy" className="underline font-semibold" style={{ color: '#dc2626' }}>
                  Cookie Policy
                </Link>{' '}
                e{' '}
                <Link href="/privacy" className="underline font-semibold" style={{ color: '#dc2626' }}>
                  Privacy Policy
                </Link>
                .
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={rejectAll}
                  className="py-3 px-4 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: '#ffffff', border: '2px solid #000000', color: '#000000' }}
                >
                  Rifiuta tutto
                </button>
                <button
                  onClick={() => setShowPrefs(true)}
                  className="py-3 px-4 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: '#ffffff', border: '2px solid #000000', color: '#000000' }}
                >
                  Personalizza
                </button>
                <button
                  onClick={acceptAll}
                  className="py-3 px-4 rounded-xl text-sm font-bold transition-all hover:brightness-110"
                  style={{ background: '#dc2626', color: '#ffffff', border: '2px solid #dc2626' }}
                >
                  Accetta tutto
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4" style={{ color: '#000000' }}>
                Preferenze cookie
              </h2>
              <div className="space-y-3 mb-5">
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
                  desc="Invia le tue query ai modelli DeepSeek (Cina) o Anthropic Claude (USA) per generare analisi anti-bias e traduzioni, e a Google Gemini (USA) per la sintesi vocale degli articoli. Senza consenso queste funzioni saranno disabilitate."
                  checked={prefs.ai_processing}
                  disabled={false}
                  onChange={(v) => setPrefs((p) => ({ ...p, ai_processing: v }))}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => setShowPrefs(false)}
                  className="py-3 px-4 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: '#ffffff', border: '2px solid #000000', color: '#000000' }}
                >
                  Indietro
                </button>
                <button
                  onClick={saveCustom}
                  className="py-3 px-4 rounded-xl text-sm font-bold transition-all hover:brightness-110"
                  style={{ background: '#dc2626', color: '#ffffff', border: '2px solid #dc2626' }}
                >
                  Salva preferenze
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
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
    <label
      className="rounded-xl p-3 flex items-start gap-3 cursor-pointer transition-colors"
      style={{
        background: checked && !disabled ? '#fef2f2' : '#f5f5f5',
        border: `2px solid ${checked && !disabled ? '#dc2626' : disabled ? '#9ca3af' : '#d4d4d4'}`,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 flex-shrink-0 w-4 h-4 cursor-pointer"
        style={{ accentColor: '#dc2626' }}
        aria-label={title}
      />
      <div>
        <p className="text-sm font-bold" style={{ color: '#000000' }}>
          {title}
          {disabled && (
            <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded" style={{ background: '#dc2626', color: '#ffffff' }}>
              Sempre attivi
            </span>
          )}
        </p>
        <p className="text-xs leading-snug mt-0.5" style={{ color: '#404040' }}>
          {desc}
        </p>
      </div>
    </label>
  )
}
