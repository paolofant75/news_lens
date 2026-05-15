import { CONFIG } from './config'
import type { NewsItem } from './types'

function titleBigrams(title: string): Set<string> {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2)  // skip stop words / articles

  const bg = new Set<string>()
  for (let i = 0; i < words.length - 1; i++) {
    bg.add(`${words[i]}_${words[i + 1]}`)
  }
  return bg
}

function jaccardSim(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1
  let inter = 0
  for (const x of a) if (b.has(x)) inter++
  return inter / (a.size + b.size - inter)
}

export function deduplicate(items: NewsItem[], existingUrls: Set<string>): NewsItem[] {
  const kept: NewsItem[] = []
  const keptBigrams: Set<string>[] = []

  for (const item of items) {
    // Level 1: exact URL match
    if (existingUrls.has(item.url)) continue

    // Level 2: title similarity (Jaccard on bigrams)
    const bg = titleBigrams(item.title)
    const isSimilar = keptBigrams.some(
      kb => jaccardSim(bg, kb) >= CONFIG.DEDUP_TITLE_SIMILARITY
    )
    if (isSimilar) continue

    kept.push(item)
    keptBigrams.push(bg)
    existingUrls.add(item.url)
  }

  return kept
}
