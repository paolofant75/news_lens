// ─────────────────────────────────────────────────────────────────────────────
// Cache Redis per le classificazioni del CategoryClassifierAgent.
//
// Chiave: ai:classify:{sha256(title|summary)}  TTL 30 giorni
//
// Usa Upstash REST API direttamente (stesso pattern di apps/web/lib/redis.ts)
// per non aggiungere dipendenze. Le env UPSTASH_REDIS_REST_URL/TOKEN sono gia'
// disponibili sia in apps/web (Vercel) sia in dev (.env.local).
//
// La cache e' fail-open: se Redis e' giu', getCachedClassification ritorna null
// e l'agente chiama l'AI; setCachedClassification fa fire-and-forget.
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from 'node:crypto'
import type { ClassificationOutput } from './schema'

export const CACHE_TTL_SECONDS = 30 * 24 * 60 * 60   // 30 giorni

/**
 * Calcola la cache key per un articolo. Hash sha256(title|summary): cosi'
 * articoli identici condividono la cache anche se arrivano da fonti diverse.
 */
export function buildCacheKey(title: string, summary: string): string {
  const h = createHash('sha256').update(`${title}|${summary}`).digest('hex')
  return `ai:classify:${h}`
}

async function redisCall(commands: unknown[][]): Promise<unknown[] | null> {
  const base = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!base || !token) return null
  try {
    const res = await fetch(`${base}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { result: unknown }[]
    return data.map((r) => r.result)
  } catch {
    return null
  }
}

/**
 * Lookup in cache. Ritorna null in caso di miss o errore (fail-open).
 * Parsa il JSON in modo tollerante: se il payload non e' piu' compatibile con
 * lo schema attuale (es. cambiamo gli enum), ritorna null cosi' l'agente
 * riclassifica.
 */
export async function getCachedClassification(
  title: string,
  summary: string,
): Promise<ClassificationOutput | null> {
  const key = buildCacheKey(title, summary)
  const result = await redisCall([['GET', key]])
  if (!result) return null
  const raw = result[0]
  if (typeof raw !== 'string') return null
  try {
    return JSON.parse(raw) as ClassificationOutput
  } catch {
    return null
  }
}

/**
 * Bulk lookup per articoli multipli. Usa MGET per un solo comando Redis
 * invece di tanti GET singoli. Usato nel cron classify-articles per il
 * pre-check cache: riduce di ~100K azioni/mese (25 GET -> 1 MGET).
 */
export async function getCachedClassificationsMany(
  articles: Array<{ id: string; title: string; summary: string }>,
): Promise<Map<string, ClassificationOutput>> {
  if (articles.length === 0) return new Map()

  const keys = articles.map(a => buildCacheKey(a.title, a.summary))
  const result = await redisCall([['MGET', ...keys]])
  if (!result) return new Map()

  const hits = new Map<string, ClassificationOutput>()
  const values = result[0] as (string | null)[]

  for (let i = 0; i < articles.length; i++) {
    const raw = values[i]
    if (typeof raw !== 'string') continue
    try {
      const classification = JSON.parse(raw) as ClassificationOutput
      hits.set(articles[i].id, classification)
    } catch {
      // skip malformed entries
    }
  }
  return hits
}

/**
 * Scrive in cache fire-and-forget. Errori silenziati: la classificazione e' gia'
 * stata fatta, non vogliamo bloccare il return per un problema di Redis.
 */
export async function setCachedClassification(
  title: string,
  summary: string,
  classification: ClassificationOutput,
): Promise<void> {
  const key = buildCacheKey(title, summary)
  await redisCall([['SET', key, JSON.stringify(classification), 'EX', String(CACHE_TTL_SECONDS)]])
}
