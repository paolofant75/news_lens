import { logger } from '../logger'
import type { NewsItem } from '../types'

const SUPABASE_URL   = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY   = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function saveItemsSupabase(items: NewsItem[]): Promise<number> {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase env vars missing')
  if (items.length === 0) return 0

  const res = await fetch(`${SUPABASE_URL}/rest/v1/news`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer':        'resolution=ignore-duplicates',
    },
    body: JSON.stringify(
      items.map(i => ({ ...i, relevance_score: i.relevance_score ?? null }))
    ),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Supabase insert failed: ${res.status} ${err}`)
  }

  logger.info(`Supabase: saved ${items.length} items`)
  return items.length
}

export async function getExistingUrlsSupabase(): Promise<Set<string>> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return new Set()

  const res = await fetch(`${SUPABASE_URL}/rest/v1/news?select=url`, {
    headers: {
      'apikey':        SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  })

  if (!res.ok) return new Set()
  const rows = await res.json() as { url: string }[]
  return new Set(rows.map(r => r.url))
}
