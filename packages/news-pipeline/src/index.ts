// Bypass SSL verification on machines with corporate SSL inspection proxies.
// Set BYPASS_SSL=1 in .env or environment. DO NOT use in production.
if (process.env.BYPASS_SSL === '1') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

import cron from 'node-cron'
import { logger } from './logger'
import { fetchGdelt } from './ingestion/gdelt'
import { fetchGoogleNews } from './ingestion/google-news'
import { fetchRsshub } from './ingestion/rsshub'
import { fetchWikipedia } from './ingestion/wikipedia'
import { normalize } from './normalize'
import { deduplicate } from './dedup'
import { enrichBatch } from './enrich'
import { saveItems, getExistingUrls, getStats } from './storage/sqlite'
import { CONFIG } from './config'

async function runPipeline(): Promise<void> {
  const start = Date.now()
  logger.info('━━━ Pipeline run START ━━━')

  // ── 1. INGESTION (fail-safe: ogni fonte è indipendente) ─────────────────────
  const [gdelt, google, rsshub, wiki] = await Promise.allSettled([
    fetchGdelt(),
    fetchGoogleNews(),
    fetchRsshub(),
    fetchWikipedia(),
  ])

  const raw = [
    ...(gdelt.status    === 'fulfilled' ? gdelt.value    : (logger.warn('GDELT failed'),    [])),
    ...(google.status   === 'fulfilled' ? google.value   : (logger.warn('Google failed'),   [])),
    ...(rsshub.status   === 'fulfilled' ? rsshub.value   : (logger.warn('RSSHub failed'),   [])),
    ...(wiki.status     === 'fulfilled' ? wiki.value     : (logger.warn('Wikipedia failed'),[],)),
  ]
  logger.info(`Fetched ${raw.length} raw items from ${[gdelt,google,rsshub,wiki].filter(r=>r.status==='fulfilled').length}/4 sources`)

  // ── 2. NORMALIZATION ────────────────────────────────────────────────────────
  const normalized = raw
    .map(normalize)
    .filter((x): x is NonNullable<typeof x> => x !== null)
  logger.info(`Normalized: ${normalized.length} valid items`)

  // ── 3. DEDUPLICATION ───────────────────────────────────────────────────────
  const existingUrls = await getExistingUrls()
  const deduped = deduplicate(normalized, existingUrls)
  logger.info(`Deduped: ${deduped.length} new (${normalized.length - deduped.length} dropped)`)

  if (deduped.length === 0) {
    logger.info(`Nothing new — done in ${Date.now() - start}ms`)
    return
  }

  // ── 4. AI ENRICHMENT (optional) ────────────────────────────────────────────
  const enriched = await enrichBatch(deduped)
  if (CONFIG.AI_ENRICH) {
    const scored = enriched.filter(i => i.relevance_score != null).length
    logger.info(`AI enriched: ${scored}/${enriched.length} items scored`)
  }

  // ── 5. STORAGE ─────────────────────────────────────────────────────────────
  const saved = await saveItems(enriched)
  const elapsed = Date.now() - start

  const stats = await getStats()
  logger.info(`Saved ${saved} new items · DB total: ${stats.total} · ${elapsed}ms`)
  logger.info('━━━ Pipeline run END ━━━')
}

// ── Scheduler ────────────────────────────────────────────────────────────────
const CRON_EXPR = `*/${CONFIG.INTERVAL_MINUTES} * * * *`
logger.info(`Scheduler: every ${CONFIG.INTERVAL_MINUTES} min (${CRON_EXPR})`)
logger.info(`Storage: SQLite @ ${CONFIG.SQLITE_PATH}`)
logger.info(`AI enrichment: ${CONFIG.AI_ENRICH ? 'enabled (Claude Haiku)' : 'disabled'}`)

cron.schedule(CRON_EXPR, () => {
  runPipeline().catch(e => logger.error(`Unhandled pipeline error: ${e}`))
})

// Immediate first run
runPipeline().catch(e => logger.error(`Initial run failed: ${e}`))
