import Parser from 'rss-parser'
import { GOOGLE_NEWS_FEEDS, CONFIG } from '../config'
import { logger } from '../logger'
import type { RawItem } from '../types'

const parser = new Parser({ timeout: CONFIG.FETCH_TIMEOUT_MS })

export async function fetchGoogleNews(): Promise<RawItem[]> {
  const results: RawItem[] = []

  for (const feed of GOOGLE_NEWS_FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url)
      const items = parsed.items.slice(0, CONFIG.MAX_ARTICLES_PER_SOURCE)

      for (const item of items) {
        if (!item.title || !item.link) continue
        results.push({
          title:        item.title,
          url:          item.link,
          source:       (item as Record<string, string>)['source'] ?? 'Google News',
          published_at: new Date(item.pubDate ?? Date.now()).toISOString(),
          language:     'en',
          content:      item.contentSnippet ?? '',
          raw_category: feed.category,
        })
      }
      logger.info(`Google News [${feed.category}]: ${items.length} items`)
    } catch (e) {
      logger.warn(`Google News [${feed.category}] failed: ${e}`)
    }
  }

  return results
}
