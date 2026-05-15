import { CONFIG } from './config'
import { logger } from './logger'
import type { NewsItem } from './types'

interface EnrichResult { category: string; score: number }

async function claudeEnrich(titles: string[]): Promise<EnrichResult[]> {
  const numbered = titles.map((t, i) => `[${i + 1}] ${t}`).join('\n')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':         process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [{
        role:    'user',
        content: `For each numbered headline, respond ONLY with a JSON array.
Each element: {"category":"technology|health|economy|conflict|environment|politics|sports|science|general","score":N}
where score 1-10 = relevance for a global news reader (10 = major world event).
Keep the same order as input. No explanation.

${numbered}`,
      }],
    }),
  })

  const data = await res.json() as { content?: { text?: string }[] }
  const text = data.content?.[0]?.text ?? '[]'
  const parsed = JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] ?? '[]') as EnrichResult[]
  return parsed
}

export async function enrichBatch(items: NewsItem[]): Promise<NewsItem[]> {
  if (!CONFIG.AI_ENRICH || items.length === 0) return items

  const result = [...items]
  const CHUNK = 20

  for (let start = 0; start < items.length; start += CHUNK) {
    const chunk = items.slice(start, start + CHUNK)
    try {
      const enriched = await claudeEnrich(chunk.map(x => x.title))
      for (let i = 0; i < chunk.length; i++) {
        const e = enriched[i]
        if (!e) continue
        result[start + i] = {
          ...result[start + i],
          category:        e.category ?? result[start + i].category,
          relevance_score: typeof e.score === 'number' ? e.score : undefined,
        }
      }
      logger.info(`AI enriched ${chunk.length} items (batch ${Math.floor(start / CHUNK) + 1})`)
    } catch (e) {
      logger.warn(`AI enrichment batch failed, keeping originals: ${e}`)
    }
  }

  return result
}
