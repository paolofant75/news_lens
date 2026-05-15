import { fetchWithRetry } from '../fetch-util'
import { logger } from '../logger'
import type { RawItem } from '../types'

const API_URL =
  'https://en.wikipedia.org/w/api.php' +
  '?action=parse&page=Portal:Current_events&prop=wikitext&format=json&origin=*'

export async function fetchWikipedia(): Promise<RawItem[]> {
  try {
    const res = await fetchWithRetry(API_URL)
    const data = await res.json() as { parse?: { wikitext?: { '*'?: string } } }
    const wikitext = data.parse?.wikitext?.['*'] ?? ''

    const items: RawItem[] = []
    const today = new Date().toISOString()

    // Extract bullet points: lines starting with * that contain [[...]] links
    const lines = wikitext.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('*')) continue

      // Extract wikilinks [[Article|Label]] or [[Article]]
      const linkMatch = trimmed.match(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/)
      if (!linkMatch) continue

      const articleTitle = linkMatch[1]
      const displayTitle = linkMatch[2] ?? linkMatch[1]

      // Strip wikitext markup to get plain text headline
      const plainText = trimmed
        .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
        .replace(/\[\[([^\]]+)\]\]/g, '$1')
        .replace(/'''?/g, '')
        .replace(/^\*+\s*/, '')
        .trim()

      if (plainText.length < 10) continue

      items.push({
        title:        plainText.slice(0, 200),
        url:          `https://en.wikipedia.org/wiki/${encodeURIComponent(articleTitle.replace(/ /g, '_'))}`,
        source:       'Wikipedia Current Events',
        published_at: today,
        language:     'en',
        content:      displayTitle,
        raw_category: 'general',
      })

      if (items.length >= 30) break
    }

    logger.info(`Wikipedia: ${items.length} items`)
    return items
  } catch (e) {
    logger.warn(`Wikipedia failed: ${e}`)
    return []
  }
}
