// ─────────────────────────────────────────────────────────────────────────────
// Variante AI del world-filter. Usa DeepSeek (via lib/ai-client.ts) per decidere
// se un articolo merita di apparire nel feed Mondo e quanto e' alto il suo
// impatto globale (0-10).
//
// Quando viene attivata
//   Solo se classifier-mode.useAIClassifier() ritorna true (USE_AI_CLASSIFIER=true).
//   Altrimenti rimane attiva la pipeline Legacy (world-filter.ts). Il toggle
//   avviene esclusivamente dentro applyWorldFilter: i consumer non sanno mai
//   quale variante stiano usando.
//
// Cache
//   Redis: `ai:wf:v1:{articleId}` con TTL 24h. La cache key e' invariante per
//   articolo (l'id e' hash stabile del link). In batch usiamo cacheMGet per
//   ridurre i round-trip Redis.
//
// Fallback
//   Se la chiamata AI fallisce (timeout 4s, errore HTTP, parse fallito), si
//   degrada SILENZIOSAMENTE alle versioni Legacy (globalImpactScoreLegacy,
//   isWorldEligibleLegacy). La UX non si rompe mai.
//
// Concorrenza
//   classifyManyAI processa in chunk di 8 chiamate parallele (rate-limit
//   conservativo per DeepSeek free tier; alzabile se necessario).
// ─────────────────────────────────────────────────────────────────────────────

import { aiComplete } from './ai-client'
import { cacheGet, cacheMGet, cacheSet } from './redis'
import {
  globalImpactScoreLegacy,
  isWorldEligibleLegacy,
  type WorldFilterShape,
} from './world-filter'

const AI_CACHE_TTL_SECONDS = 24 * 60 * 60
const AI_TIMEOUT_MS = 4000
const CONCURRENCY = 8

export type AIClassification = {
  globalImpactScore: number   // 0-10
  isWorldEligible: boolean
  reasoning?: string
}

function cacheKey(articleId: string): string {
  return `ai:wf:v1:${articleId}`
}

function legacyClassification(a: WorldFilterShape): AIClassification {
  return {
    globalImpactScore: globalImpactScoreLegacy(a),
    isWorldEligible: isWorldEligibleLegacy(a),
  }
}

// Prompt di sistema: definisce la rubrica di scoring e il formato di output.
// Tenuto SHORT per minimizzare il consumo token (~150 tok system + ~60 tok user).
const SYSTEM_PROMPT = `Sei un editor di un terminale geopolitico globale (stile Bloomberg).
Decidi se una notizia merita di apparire in un feed mondo (eventi internazionali, geopolitici, macro)
oppure se e' rumore locale/regionale.

Rispondi SOLO con JSON valido nel formato esatto:
{"globalImpactScore": 0-10, "isWorldEligible": true|false, "reasoning": "max 12 parole"}

Rubrica score:
0-2 = solo locale (cronaca quartiere, sport amatoriali, eventi cittadini)
3-5 = nazionale ordinario (politica interna, sport nazionale, cronaca regionale)
6-7 = rilevanza internazionale (G7/G20/ONU/NATO, Vaticano, elezioni grandi paesi, mercati nazionali con eco UE)
8-10 = globale (guerre, pandemie, crash globali, decisioni storiche)

Regola isWorldEligible:
- sourceScope=local  -> SEMPRE false (anche se score alto)
- sourceScope=international -> SEMPRE true (anche se score basso, e' una fonte globale di default)
- sourceScope=national -> true SOLO se score >= 6`

function buildUserPrompt(a: WorldFilterShape): string {
  const summary = (a.summary ?? '').slice(0, 400)
  return [
    `Source: ${a.source ?? 'unknown'}`,
    `scope: ${a.sourceScope ?? 'unknown'}`,
    `country: ${a.sourceCountry ?? 'unknown'}`,
    `tier: ${a.sourceGlobalTier ?? '-'}`,
    `reliability: ${a.sourceReliability ?? '-'}`,
    '',
    `Title: ${a.title ?? ''}`,
    summary ? `Summary: ${summary}` : '',
  ].filter(Boolean).join('\n')
}

function parseAIResponse(raw: string): AIClassification | null {
  // Strip fenced markdown (qualche modello le include nonostante l'istruzione)
  const cleaned = raw.replace(/```json\s*|\s*```/g, '').trim()
  // Match del primo oggetto JSON nella risposta
  const match = cleaned.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    const obj = JSON.parse(match[0]) as Record<string, unknown>
    const score = typeof obj.globalImpactScore === 'number' ? obj.globalImpactScore : NaN
    const eligible = typeof obj.isWorldEligible === 'boolean' ? obj.isWorldEligible : null
    if (Number.isNaN(score) || eligible === null) return null
    return {
      globalImpactScore: Math.max(0, Math.min(10, Math.round(score))),
      isWorldEligible: eligible,
      reasoning: typeof obj.reasoning === 'string' ? obj.reasoning.slice(0, 200) : undefined,
    }
  } catch {
    return null
  }
}

// Promise.race con timeout, evita di aspettare DeepSeek per piu' di AI_TIMEOUT_MS.
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timeout ${ms}ms`)), ms)),
  ])
}

// Chiamata AI singola (no cache lookup, no fallback). Esposta solo internamente.
async function aiClassifyRaw(a: WorldFilterShape): Promise<AIClassification | null> {
  try {
    const raw = await withTimeout(
      aiComplete({
        tier: 'fast',          // -> deepseek-chat (oppure claude-haiku se Anthropic fallback)
        context: 'world-filter',
        maxTokens: 80,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(a) },
        ],
      }),
      AI_TIMEOUT_MS,
      'ai-classify',
    )
    return parseAIResponse(raw)
  } catch (err) {
    console.warn('[world-filter-ai] AI call failed:', (err as Error).message)
    return null
  }
}

// ─── API pubblica ────────────────────────────────────────────────────────────

/**
 * Classifica un singolo articolo via AI con cache + fallback Legacy.
 * Sempre risolve a una classificazione valida (mai throws).
 */
export async function classifyOneAI(a: WorldFilterShape): Promise<AIClassification> {
  // 1) Cache lookup (skip se l'articolo non ha id)
  if (a.id) {
    try {
      const cached = await cacheGet(cacheKey(a.id))
      if (cached) {
        const parsed = JSON.parse(cached) as AIClassification
        return parsed
      }
    } catch { /* cache miss/parse error -> proceed to AI */ }
  }

  // 2) AI call
  const aiResult = await aiClassifyRaw(a)
  if (!aiResult) {
    // 3a) Fallback Legacy (NON cachiamo il fallback: vogliamo riprovare AI al prossimo refresh)
    return legacyClassification(a)
  }

  // 3b) Cache write fire-and-forget
  if (a.id) {
    cacheSet(cacheKey(a.id), JSON.stringify(aiResult), AI_CACHE_TTL_SECONDS).catch(() => {})
  }
  return aiResult
}

/**
 * Score 0-10 di impatto globale (versione AI). Wrapper su classifyOneAI.
 */
export async function globalImpactScoreAI(a: WorldFilterShape): Promise<number> {
  const c = await classifyOneAI(a)
  return c.globalImpactScore
}

/**
 * Decide se un articolo entra nel feed Mondo (versione AI). Wrapper su classifyOneAI.
 */
export async function isWorldEligibleAI(a: WorldFilterShape): Promise<boolean> {
  const c = await classifyOneAI(a)
  return c.isWorldEligible
}

/**
 * Classifica N articoli in batch. Ottimizzato:
 *   1) Una sola cacheMGet per recuperare tutti i record gia' cachati
 *   2) Solo i missing vengono mandati ad AI, in chunk di CONCURRENCY paralleli
 *   3) Ogni AI risultato viene cachato fire-and-forget
 *
 * Ritorna una Map indicizzata per reference all'articolo passato (non per id):
 * cosi' il chiamante puo' iterare sulla lista originale senza dover ricostruire
 * la mappatura.
 */
export async function classifyManyAI<T extends WorldFilterShape>(
  items: T[],
): Promise<Map<T, AIClassification>> {
  const out = new Map<T, AIClassification>()
  if (items.length === 0) return out

  // 1) Batch cache lookup per gli articoli con id
  const itemsWithId = items.filter((it) => Boolean(it.id))
  const keys = itemsWithId.map((it) => cacheKey(it.id!))
  let cached: (string | null)[] = []
  try {
    cached = keys.length > 0 ? await cacheMGet(keys) : []
  } catch { cached = keys.map(() => null) }

  const missingIdx: number[] = []
  itemsWithId.forEach((it, i) => {
    const raw = cached[i]
    if (!raw) { missingIdx.push(i); return }
    try {
      out.set(it, JSON.parse(raw) as AIClassification)
    } catch {
      missingIdx.push(i)
    }
  })

  // 2) Articoli senza id: sempre classificati live (nessuna cache possibile)
  const noIdItems = items.filter((it) => !it.id)
  const liveItems: T[] = [
    ...missingIdx.map((i) => itemsWithId[i]),
    ...noIdItems,
  ]

  // 3) Chunked parallelism per non saturare il rate limit DeepSeek
  for (let i = 0; i < liveItems.length; i += CONCURRENCY) {
    const chunk = liveItems.slice(i, i + CONCURRENCY)
    const results = await Promise.all(chunk.map(classifyOneAI))
    chunk.forEach((it, j) => out.set(it, results[j]))
  }

  return out
}
