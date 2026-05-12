/**
 * Feed Pipeline — ispirato all'architettura NewsBlur (github.com/samuelclay/NewsBlur)
 * Pipeline: RSS Sources → Fetch → Normalize → Deduplicate → Enrich → Deliver
 */

import crypto from 'crypto'

export type RawStory = {
  title: string
  link: string
  pubDate: string
  source: string
  summary: string
  guid?: string
}

export type NormalizedStory = RawStory & {
  storyHash: string     // guid_hash: fingerprint univoco
  contentHash: string   // hash del contenuto per dedup semantica
}

/** Genera un hash stabile per deduplicazione — come story_hash in NewsBlur */
export function storyHash(story: RawStory): string {
  // Priorità: guid originale > URL > titolo normalizzato
  const key = story.guid || story.link || normTitle(story.title)
  return crypto.createHash('md5').update(key).digest('hex').slice(0, 16)
}

/** Hash del contenuto per deduplicare storie identiche con URL diversi */
export function contentHash(story: RawStory): string {
  const content = normTitle(story.title) + '|' + story.source.toLowerCase()
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 16)
}

/** Normalizza un titolo per confronto: minuscolo, no punteggiatura */
function normTitle(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80)
}

/**
 * Deduplicazione a due livelli:
 * 1. story_hash (URL/guid esatto) → stesso articolo da feed multipli
 * 2. content_hash (titolo+fonte) → stesso articolo con URL leggermente diverso
 */
export function deduplicateStories<T extends RawStory>(stories: T[]): T[] {
  const seenHash = new Set<string>()
  const seenContent = new Set<string>()
  const result: T[] = []

  for (const story of stories) {
    const sh = storyHash(story)
    const ch = contentHash(story)

    if (seenHash.has(sh) || seenContent.has(ch)) continue

    seenHash.add(sh)
    seenContent.add(ch)
    result.push(story)
  }

  return result
}

/**
 * Pipeline completa — da lista grezza a lista normalizzata e deduplicata
 * Ordine: fetch → normalize → deduplicate → sort by date
 */
export function runPipeline<T extends RawStory>(
  stories: T[],
  options: { maxPerSource?: number; maxTotal?: number } = {}
): T[] {
  const { maxPerSource = 15, maxTotal = 300 } = options

  // 1. Filtra storie senza titolo o link
  const valid = stories.filter((s) => s.title?.trim() && s.link?.trim())

  // 2. Limita per fonte (evita che una fonte domini)
  const countPerSource = new Map<string, number>()
  const capped = valid.filter((s) => {
    const cnt = countPerSource.get(s.source) ?? 0
    if (cnt >= maxPerSource) return false
    countPerSource.set(s.source, cnt + 1)
    return true
  })

  // 3. Deduplica
  const deduped = deduplicateStories(capped)

  // 4. Sort per data (più recente prima)
  const sorted = deduped.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  )

  return sorted.slice(0, maxTotal)
}
