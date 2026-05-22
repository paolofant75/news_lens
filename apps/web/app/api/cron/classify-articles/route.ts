// ─────────────────────────────────────────────────────────────────────────────
// Cron: classifica articoli del pool corrente via CategoryClassifierAgent.
//
// Trigger:
//   GET /api/cron/classify-articles  (auth Bearer CRON_SECRET)
//   Schedulato da vercel.json ogni 10 minuti.
//
// Quando NON gira:
//   classifierCronShouldRun()===false (USE_AI_CLASSIFIER=false E
//   AI_CLASSIFIER_SHADOW_MODE=false): il cron ritorna 200 con
//   { skipped: true } senza chiamare Anthropic. Zero spesa quando l'agente
//   non e' attivo.
//
// Pipeline:
//   1) Legge il pool dalla cache Redis nlv_articles_v5
//   2) Filtra gli articoli SENZA aiCategory (gli altri sono gia' classificati
//      e cachati 30gg dall'agente).
//   3) Limita a BATCH_SIZE per evitare timeout 60s Vercel Hobby (5 batch da 5
//      concorrenti ≈ 15-20s totali su Sonnet).
//   4) runAgent per ognuno (telemetria automatica via AgentRun su DB).
//   5) Merge dei risultati nel pool e riscrittura cache.
//   6) Niente invalidazione esplicita: il cron refresh-feeds (5 min)
//      sovrascrive comunque il pool, e la cache dell'agente
//      (ai:classify:{hash}) ha TTL 30gg quindi i campi AI persistono
//      anche dopo refresh.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { cacheGet, cacheSet } from '../../../../lib/redis'
import { classifierCronShouldRun } from '../../../../lib/classifier-mode'
import { runAgent } from '@news-lens-veritas/ai'
import { categoryClassifier, getCachedClassification } from '@news-lens-veritas/ai/category-classifier'
import type { Article } from '../../../../lib/rss'

export const runtime = 'nodejs'
export const maxDuration = 60

// Stessa chiave usata da fetchArticlesFresh / refresh-feeds
const ARTICLES_FRESH_KEY = 'nlv_articles_v5'
const ARTICLES_STALE_KEY = 'nlv_articles_v5_stale'
const ARTICLES_CACHE_TTL = 600     // 10 min, come refresh-feeds
const ARTICLES_STALE_TTL = 1800    // 30 min

const BATCH_SIZE = 25         // articoli per esecuzione cron
const CONCURRENCY = 5         // chiamate Anthropic parallele

async function processInChunks<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = []
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency)
    const settled = await Promise.allSettled(chunk.map(fn))
    for (const s of settled) {
      // Promise.allSettled non rejecta: gli errori sono gia' loggati da runAgent
      results.push(s.status === 'fulfilled' ? s.value : (null as R))
    }
  }
  return results
}

export async function GET(req: NextRequest) {
  // Auth: stesso pattern di /api/cron/refresh-feeds
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Short-circuit: nessuna spesa Anthropic se l'agente non e' attivo
  if (!classifierCronShouldRun()) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: 'USE_AI_CLASSIFIER=false and AI_CLASSIFIER_SHADOW_MODE=false',
    })
  }

  // 1) Pool corrente
  const raw = await cacheGet(ARTICLES_FRESH_KEY)
  if (!raw) {
    // Pool vuoto e' uno stato transitorio normale (cold-start, migrazione):
    // refresh-feeds popola la cache ogni 5 min, non e' un errore del server.
    return NextResponse.json({
      ok: true,
      processed: 0,
      cached: 0,
      errors: 0,
      reason: 'pool vuoto, aspetta cron refresh-feeds',
    })
  }

  let pool: Article[]
  try { pool = JSON.parse(raw) as Article[] }
  catch { return NextResponse.json({ ok: false, error: 'pool corrupted' }, { status: 500 }) }

  // 2) Articoli da classificare (no aiCategory ancora)
  const toClassify = pool.filter((a) => !a.aiCategory).slice(0, BATCH_SIZE)
  if (toClassify.length === 0) {
    return NextResponse.json({ ok: true, processed: 0, cached: pool.length, errors: 0, reason: 'tutto gia\' classificato' })
  }

  // 3) Pre-check cache (alcuni articoli identici a stessi titolo/summary potrebbero
  // gia' essere classificati anche se nuovi nel pool). Risparmia chiamate AI.
  const cacheHits = new Map<string, Awaited<ReturnType<typeof getCachedClassification>>>()
  await Promise.all(toClassify.map(async (a) => {
    const c = await getCachedClassification(a.title, a.summary)
    if (c) cacheHits.set(a.id, c)
  }))

  // 4) Solo gli articoli con cache miss vanno via runAgent (telemetria DB + retry)
  const needAI = toClassify.filter((a) => !cacheHits.has(a.id))

  type RunResult = { id: string; ok: boolean; data?: Awaited<ReturnType<typeof getCachedClassification>>; error?: string }

  const aiResults = await processInChunks<typeof needAI[number], RunResult>(needAI, CONCURRENCY, async (a) => {
    const res = await runAgent(categoryClassifier, {
      title: a.title,
      summary: a.summary,
      sourceName: a.source,
      language: 'it',
    }, { timeoutMs: 20_000, retries: 1 })
    if (res.ok) return { id: a.id, ok: true, data: res.output }
    return { id: a.id, ok: false, error: res.error }
  })

  // 5) Merge dei risultati (AI + cache hits) nel pool
  const idToOutput = new Map<string, NonNullable<RunResult['data']>>()
  for (const r of aiResults) {
    if (r && r.ok && r.data) idToOutput.set(r.id, r.data)
  }
  for (const [id, data] of cacheHits.entries()) {
    if (data) idToOutput.set(id, data)
  }

  let updated = 0
  const newPool = pool.map((a) => {
    const out = idToOutput.get(a.id)
    if (!out) return a
    updated++
    return {
      ...a,
      aiCategory: out.primaryCategory,
      aiCategoriesSecondary: out.secondaryCategories,
      aiGeoScope: out.geoScope.primary,
      aiGlobalImpactScore: out.globalImpact.score,
      aiGlobalImpactReasoning: out.globalImpact.reasoning,
      aiWorldEligible: out.worldEligible,
      aiConfidence: out.confidence,
      aiFlags: out.flags,
    }
  })

  // 6) Riscrivi cache (fresh + stale, stessa coppia di refresh-feeds)
  await Promise.all([
    cacheSet(ARTICLES_FRESH_KEY, JSON.stringify(newPool), ARTICLES_CACHE_TTL),
    cacheSet(ARTICLES_STALE_KEY, JSON.stringify(newPool), ARTICLES_STALE_TTL),
  ])

  const aiOk = aiResults.filter((r) => r && r.ok).length
  const aiErr = aiResults.filter((r) => r && !r.ok).length

  return NextResponse.json({
    ok: true,
    processed: toClassify.length,
    aiCalls: needAI.length,
    aiOk,
    aiErr,
    cacheHits: cacheHits.size,
    poolSize: pool.length,
    updated,
  })
}
