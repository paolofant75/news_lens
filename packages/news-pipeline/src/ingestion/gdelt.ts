import { fetchWithRetry } from '../fetch-util'
import { logger } from '../logger'
import type { RawItem } from '../types'

interface GdeltArticle {
  title?: string
  url?: string
  domain?: string
  seendate?: string   // formato: '20240515T120000Z'
  language?: string
  themes?: string[]
}

function gdeltDateToISO(seendate: string): string {
  // '20240515T120000Z' → '2024-05-15T12:00:00Z'
  const m = seendate.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/)
  if (!m) return new Date().toISOString()
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`
}

export async function fetchGdelt(): Promise<RawItem[]> {
  const url =
    'https://api.gdeltproject.org/api/v2/doc/doc' +
    '?query=&mode=artlist&format=json&maxrecords=50&sort=DateDesc'

  const res = await fetchWithRetry(url)
  const data = await res.json() as { articles?: GdeltArticle[] }
  const articles = data.articles ?? []

  logger.info(`GDELT: ${articles.length} raw articles`)

  return articles
    .filter(a => a.title && a.url)
    .map(a => ({
      title:        a.title!,
      url:          a.url!,
      source:       a.domain ?? 'GDELT',
      published_at: gdeltDateToISO(a.seendate ?? ''),
      language:     a.language?.toLowerCase() ?? 'en',
      content:      '',
      raw_category: a.themes?.[0] ?? '',
    }))
}
