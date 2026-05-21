// ─────────────────────────────────────────────────────────────────────────────
// Diff endpoint: confronta classificazione AI (dal cron classify-articles)
// vs Legacy (keyword/regex) sugli articoli del pool corrente.
//
// Utile in SHADOW MODE: il cron popola i campi aiCategory/aiWorldEligible/...
// senza che la UI li usi, e questo endpoint mostra dove AI e Legacy
// divergono. Permette di validare la qualita' AI prima di flippare
// USE_AI_CLASSIFIER=true.
//
// Soglie "divergenza":
//   - primaryCategory diversa
//   - worldEligible diverso
//   - |aiGlobalImpactScore - globalImpactScoreLegacy| > 2
//
// Pool size atteso ~600 articoli; il diff e' in-memory, latenza < 200ms.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cacheGet } from '../../../../lib/redis'
import { globalImpactScoreLegacy, isWorldEligibleLegacy } from '../../../../lib/world-filter'
import { useAIClassifier, shadowMode } from '../../../../lib/classifier-mode'
import type { Article } from '../../../../lib/rss'

const ADMIN_EMAIL = 'fantinel.paolo@gmail.com'
const ARTICLES_KEY = 'nlv_articles_v5'
const SCORE_DELTA_THRESHOLD = 2

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function authorize(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return { ok: false as const, status: 401, error: 'missing bearer token' }
  const token = auth.slice(7)
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return { ok: false as const, status: 401, error: 'invalid token' }
  if (user.email !== ADMIN_EMAIL) return { ok: false as const, status: 403, error: 'forbidden' }
  return { ok: true as const }
}

type DiffItem = {
  id: string
  title: string
  source: string
  sourceScope: string | undefined
  sourceCountry: string | undefined
  legacy: { globalImpactScore: number; isWorldEligible: boolean }
  ai: {
    primaryCategory: string
    globalImpactScore: number
    isWorldEligible: boolean
    confidence: number
    reasoning: string
    flags: string[]
  }
  diffs: {
    worldEligibilityDiffers: boolean
    scoreDelta: number
    scoreDeltaSignificant: boolean
  }
}

export async function GET(req: NextRequest) {
  const auth = await authorize(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const raw = await cacheGet(ARTICLES_KEY)
  if (!raw) {
    return NextResponse.json({ error: 'pool vuoto (aspetta cron refresh-feeds)' }, { status: 503 })
  }
  let pool: Article[]
  try { pool = JSON.parse(raw) as Article[] }
  catch { return NextResponse.json({ error: 'pool corrupted' }, { status: 500 }) }

  // Considera solo articoli con campi AI presenti (gli altri non sono ancora
  // stati visti dal cron classify-articles)
  const classified = pool.filter((a) => typeof a.aiWorldEligible === 'boolean' && typeof a.aiGlobalImpactScore === 'number')

  const items: DiffItem[] = []
  for (const a of classified) {
    const legacyScore = globalImpactScoreLegacy(a)
    const legacyEligible = isWorldEligibleLegacy(a)
    const aiScore = a.aiGlobalImpactScore as number
    const aiEligible = a.aiWorldEligible as boolean
    const scoreDelta = aiScore - legacyScore
    const eligDiffers = legacyEligible !== aiEligible
    const scoreSignificant = Math.abs(scoreDelta) > SCORE_DELTA_THRESHOLD

    if (!eligDiffers && !scoreSignificant) continue   // concordi -> skip

    items.push({
      id: a.id,
      title: a.title.slice(0, 180),
      source: a.source,
      sourceScope: a.sourceScope,
      sourceCountry: a.sourceCountry,
      legacy: { globalImpactScore: legacyScore, isWorldEligible: legacyEligible },
      ai: {
        primaryCategory: a.aiCategory ?? 'unknown',
        globalImpactScore: aiScore,
        isWorldEligible: aiEligible,
        confidence: a.aiConfidence ?? 0,
        reasoning: a.aiGlobalImpactReasoning ?? '',
        flags: a.aiFlags ?? [],
      },
      diffs: {
        worldEligibilityDiffers: eligDiffers,
        scoreDelta,
        scoreDeltaSignificant: scoreSignificant,
      },
    })
  }

  // Ordina: prima i diff piu' "forti" (eligibility diversa + scoreDelta grande)
  items.sort((a, b) => {
    const wa = (a.diffs.worldEligibilityDiffers ? 100 : 0) + Math.abs(a.diffs.scoreDelta)
    const wb = (b.diffs.worldEligibilityDiffers ? 100 : 0) + Math.abs(b.diffs.scoreDelta)
    return wb - wa
  })

  return NextResponse.json({
    mode: {
      useAIClassifier: useAIClassifier(),
      shadowMode: shadowMode(),
    },
    poolSize: pool.length,
    classifiedSize: classified.length,
    divergent: items.length,
    convergent: classified.length - items.length,
    items,
  })
}
