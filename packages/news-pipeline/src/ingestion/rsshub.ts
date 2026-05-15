import Parser from 'rss-parser'
import { RSSHUB_FEEDS, CONFIG } from '../config'
import { logger } from '../logger'
import type { RawItem } from '../types'

const parser = new Parser({ timeout: CONFIG.FETCH_TIMEOUT_MS })

export async function fetchRsshub(): Promise<RawItem[]> {
  const results: RawItem[] = []

  for (const feed of RSSHUB_FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url)
      const items = parsed.items.slice(0, CONFIG.MAX_ARTICLES_PER_SOURCE)

      for (const item of items) {
        if (!item.title || !item.link) continue
        results.push({
          title:        item.title,
          url:          item.link,
          source:       feed.source,
          published_at: new Date(item.pubDate ?? Date.now()).toISOString(),
          language:     'en',
          content:      item.contentSnippet ?? item.summary ?? '',
          raw_category: feed.category,
        })
      }
      logger.info(`RSSHub [${feed.source}]: ${items.length} items`)
    } catch (e) {
      logger.warn(`RSSHub [${feed.source}] failed: ${e}`)
    }
  }

  return results
}
