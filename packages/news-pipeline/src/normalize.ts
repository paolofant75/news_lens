import crypto from 'crypto'
import type { RawItem, NewsItem } from './types'

export function normalize(raw: RawItem): NewsItem | null {
  const url = raw.url?.trim()
  const title = raw.title?.trim()
  if (!url || !title || title.length < 5) return null

  return {
    id:           crypto.createHash('sha256').update(url).digest('hex').slice(0, 16),
    title,
    content:      raw.content?.trim() ?? '',
    source:       raw.source?.trim() ?? 'Unknown',
    url,
    published_at: raw.published_at ?? new Date().toISOString(),
    language:     raw.language ?? 'en',
    category:     mapCategory(raw.raw_category ?? ''),
    relevance_score: undefined,
  }
}

function mapCategory(raw: string): string {
  const s = raw.toLowerCase()
  if (/tech|digit|ai\b|cyber|softw|chip|robot|innov/.test(s))   return 'technology'
  if (/health|medic|virus|vaccin|pandemic|hospital|who/.test(s)) return 'health'
  if (/econom|market|financ|bank|gdp|trade|tariff|stock/.test(s)) return 'economy'
  if (/war|conflict|militar|attack|missile|nato|troops/.test(s)) return 'conflict'
  if (/climat|environ|co2|carbon|forest|energy|flood/.test(s))   return 'environment'
  if (/politic|elect|govern|president|parliament|vote/.test(s))  return 'politics'
  if (/sport|football|soccer|olympic|champion/.test(s))          return 'sports'
  if (/scienc|research|space|nasa|discover/.test(s))             return 'science'
  return 'general'
}
