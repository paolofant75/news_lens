// ─────────────────────────────────────────────────────────────────────────────
// Shadow comparison: per ogni articolo del sample esegue in parallelo la
// classificazione Legacy (keyword/regex) e la classificazione AI (DeepSeek
// via lib/world-filter-ai.ts), poi ritorna il delta. Permette di valutare la
// qualita' del classifier AI PRIMA di flippare USE_AI_CLASSIFIER=true in prod.
//
// L'endpoint chiama classifyOneAI() che by-passa il flag USE_AI_CLASSIFIER:
// il sample comparison funziona anche con il flag = false (com'e' di default
// in produzione adesso).
//
// Auth: stesso pattern di /api/admin/dashboard (Bearer Supabase + check email
// admin ADMIN_EMAIL).
//
// Costo: ~$0.001-0.002 per articolo via DeepSeek (Haiku-equivalent). Sample
// 20 articoli = ~$0.04 a chiamata, ammortizzato grazie alla cache 24h.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cacheGet } from '../../../../lib/redis'
import {
  globalImpactScoreLegacy,
  isWorldEligibleLegacy,
  type WorldFilterShape,
} from '../../../../lib/world-filter'
import { classifyOneAI } from '../../../../lib/world-filter-ai'
import type { Article } from '../../../../lib/rss'

const ADMIN_EMAIL = 'fantinel.paolo@gmail.com'
const ARTICLES_KEY = 'nlv_articles_v5'
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function authorize(
  req: NextRequest,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return { ok: false, status: 401, error: 'missing bearer token' }
  const token = auth.slice(7)
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return { ok: false, status: 401, error: 'invalid token' }
  if (user.email !== ADMIN_EMAIL) return { ok: false, status: 403, error: 'forbidden' }
  return { ok: true }
}

type CompareItem = {
  id: string
  source: string
  title: string
  sourceScope: string | undefined
  sourceCountry: string | undefined
  legacy: { globalImpactScore: number; isWorldEligible: boolean }
  ai: {
    globalImpactScore: number
    isWorldEligible: boolean
    reasoning?: string
    error?: string         // popolato se il fallback Legacy e' scattato
  }
  match: { eligibility: boolean; scoreDelta: number }
}

type CompareSummary = {
  total: number
  eligibilityMatchPct: number      // % articoli su cui Legacy e AI concordano
  avgAbsScoreDelta: number          // |scoreLegacy - scoreAI| medio
  aiAdmittedMorePct: number         // % AI mette eligible quando Legacy no
  aiAdmittedLessPct: number         // % AI mette NON eligible quando Legacy si'
  aiFallbackCount: number           // quante volte AI ha failed -> usato Legacy come AI
  generatedAt: string
}

export async function GET(req: NextRequest) {
  const auth = await authorize(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const url = new URL(req.url)
  const limitRaw = Number(url.searchParams.get('limit') ?? DEFAULT_LIMIT)
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(MAX_LIMIT, Math.floor(limitRaw))) : DEFAULT_LIMIT

  // 1) Pesca il pool dalla cache (no fetch live: troppo lento, e vogliamo
  // confrontare AI/Legacy su articoli reali gia' classificati nel sistema).
  let pool: Article[] = []
  try {
    const raw = await cacheGet(ARTICLES_KEY)
    if (raw) pool = JSON.parse(raw) as Article[]
  } catch { /* pool vuoto */ }

  if (pool.length === 0) {
    return NextResponse.json(
      { error: 'pool articoli vuoto: la cache nlv_articles_v5 non e\' popolata. Aspetta il prossimo cron refresh-feeds.' },
      { status: 503 },
    )
  }

  // 2) Sample: prendi i primi `limit` articoli con id (necessario per cache key AI)
  const sample = pool.filter((a) => Boolean(a.id)).slice(0, limit)

  // 3) Per ogni articolo, esegui Legacy (sync) + AI (await) in parallelo.
  // Promise.all su `sample.length` chiamate: ogni classifyOneAI gestisce
  // internamente cache, timeout e fallback. Quindi qui niente try/catch
  // aggressivo: il fallback e' sempre invisibile (ritorna un AIClassification
  // valido anche in caso di errore di rete).
  const items: CompareItem[] = await Promise.all(
    sample.map(async (a) => {
      const shape: WorldFilterShape = {
        id: a.id,
        source: a.source,
        title: a.title,
        summary: a.summary,
        sourceScope: a.sourceScope,
        sourceCountry: a.sourceCountry,
        sourceGlobalTier: a.sourceGlobalTier,
        sourceReliability: a.sourceReliability,
      }
      const legacy = {
        globalImpactScore: globalImpactScoreLegacy(shape),
        isWorldEligible: isWorldEligibleLegacy(shape),
      }
      const aiResult = await classifyOneAI(shape)

      // Heuristic per riconoscere il fallback: se AI ritorna ESATTAMENTE gli stessi
      // valori del Legacy senza reasoning, e' probabile che sia il fallback path
      // (vedi world-filter-ai.ts: legacyClassification non setta reasoning).
      const isLikelyFallback = !aiResult.reasoning
        && aiResult.globalImpactScore === legacy.globalImpactScore
        && aiResult.isWorldEligible === legacy.isWorldEligible

      return {
        id: a.id,
        source: a.source,
        title: a.title.slice(0, 160),
        sourceScope: a.sourceScope,
        sourceCountry: a.sourceCountry,
        legacy,
        ai: {
          globalImpactScore: aiResult.globalImpactScore,
          isWorldEligible: aiResult.isWorldEligible,
          reasoning: aiResult.reasoning,
          error: isLikelyFallback ? 'fallback (cache vuota+AI fail)' : undefined,
        },
        match: {
          eligibility: legacy.isWorldEligible === aiResult.isWorldEligible,
          scoreDelta: aiResult.globalImpactScore - legacy.globalImpactScore,
        },
      }
    }),
  )

  // 4) Summary
  const matched = items.filter((it) => it.match.eligibility).length
  const aiAdmittedMore = items.filter((it) => !it.legacy.isWorldEligible && it.ai.isWorldEligible).length
  const aiAdmittedLess = items.filter((it) => it.legacy.isWorldEligible && !it.ai.isWorldEligible).length
  const fallbackCount = items.filter((it) => it.ai.error).length
  const avgAbsScoreDelta = items.length === 0 ? 0
    : items.reduce((acc, it) => acc + Math.abs(it.match.scoreDelta), 0) / items.length

  const summary: CompareSummary = {
    total: items.length,
    eligibilityMatchPct: items.length === 0 ? 0 : Math.round((matched / items.length) * 1000) / 10,
    avgAbsScoreDelta: Math.round(avgAbsScoreDelta * 10) / 10,
    aiAdmittedMorePct: items.length === 0 ? 0 : Math.round((aiAdmittedMore / items.length) * 1000) / 10,
    aiAdmittedLessPct: items.length === 0 ? 0 : Math.round((aiAdmittedLess / items.length) * 1000) / 10,
    aiFallbackCount: fallbackCount,
    generatedAt: new Date().toISOString(),
  }

  return NextResponse.json({ summary, items })
}
