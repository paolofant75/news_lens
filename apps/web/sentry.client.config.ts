// Sentry client-side config — consenso GDPR condizionato
//
// Per attivare Sentry installa il pacchetto:
//   pnpm add @sentry/nextjs --filter apps/web
// Poi aggiungi a next.config.ts:
//   import { withSentryConfig } from '@sentry/nextjs'
//   export default withSentryConfig(nextConfig, { ... })
// Infine aggiungi a .env.local:
//   NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

const STORAGE_KEY = 'nlv_consent_v2'

function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as { acceptedCategories?: string[] }
    return (
      Array.isArray(parsed.acceptedCategories) &&
      parsed.acceptedCategories.includes('analytics')
    )
  } catch {
    return false
  }
}

let sentryInitialized = false

async function initSentry(): Promise<void> {
  if (sentryInitialized || !process.env.NEXT_PUBLIC_SENTRY_DSN) return
  try {
    // dynamic import — silently skipped until @sentry/nextjs is installed
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Sentry: any = await import('@sentry/nextjs').catch(() => null)
    if (!Sentry) return
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: 0.05,
    })
    sentryInitialized = true
  } catch {
    // package not yet installed — no-op
  }
}

async function teardownSentry(): Promise<void> {
  if (!sentryInitialized) return
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Sentry: any = await import('@sentry/nextjs').catch(() => null)
    if (Sentry) await Sentry.close(2000)
  } catch {
    // ignore
  }
  sentryInitialized = false
}

if (typeof window !== 'undefined') {
  if (hasAnalyticsConsent()) {
    void initSentry()
  }

  window.addEventListener('consent:change', () => {
    if (hasAnalyticsConsent()) void initSentry()
    else void teardownSentry()
  })
}
