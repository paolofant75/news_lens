'use client'

// CTA "Entra nel feed" con tracking fire-and-forget.
// Il click invia un beacon a /api/landing/cta e naviga subito a /dashboard.
// Se Supabase o l'endpoint falliscono, la navigazione avviene comunque.

import Link from 'next/link'
import { IconArrow } from './LineIcons'

type Variant = 'primary' | 'secondary'

interface Props {
  source: 'hero' | 'footer' | 'feature'
  href?: string
  label?: string
  variant?: Variant
  showArrow?: boolean
}

export default function TrackedCTA({
  source,
  href = '/dashboard',
  label = 'Entra nel feed',
  variant = 'primary',
  showArrow = true,
}: Props) {
  const onClick = () => {
    // sendBeacon è non-bloccante, garantisce l'invio anche durante la navigazione
    try {
      const payload = JSON.stringify({ source, ts: Date.now() })
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon('/api/landing/cta', new Blob([payload], { type: 'application/json' }))
      }
    } catch { /* silenzioso: il tracking non deve mai bloccare la UX */ }
  }

  const styles =
    variant === 'primary'
      ? { background: 'var(--accent)', color: '#0a0a0a', border: '1px solid var(--accent)' }
      : { background: 'transparent', color: 'var(--text)', border: '1px solid rgba(255,255,255,0.18)' }

  return (
    <Link
      href={href}
      onClick={onClick}
      className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-sm transition-opacity hover:opacity-85"
      style={styles}
    >
      {label}
      {showArrow && <IconArrow size={16} />}
    </Link>
  )
}
