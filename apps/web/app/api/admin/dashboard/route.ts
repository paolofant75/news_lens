import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PRICING_PER_M, tokenCost } from '../../../../lib/ai-pricing'
import { FEEDS } from '../../../../lib/rss'
import { cacheGet } from '../../../../lib/redis'

const ADMIN_EMAIL = 'fantinel.paolo@gmail.com'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function authorize(req: NextRequest): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return { ok: false, status: 401, error: 'missing bearer token' }
  const token = auth.slice(7)
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return { ok: false, status: 401, error: 'invalid token' }
  if (user.email !== ADMIN_EMAIL) return { ok: false, status: 403, error: 'forbidden' }
  return { ok: true }
}

// Health check di tutti i sub-processor
async function getHealth() {
  async function timed<T>(fn: () => Promise<T>): Promise<{ ok: boolean; ms: number; message?: string; error?: string }> {
    const start = Date.now()
    try {
      const result = await fn()
      const r = result as { ok?: boolean; message?: string } | null
      return { ok: r?.ok !== false, ms: Date.now() - start, message: r?.message }
    } catch (e) {
      return { ok: false, ms: Date.now() - start, error: String(e) }
    }
  }

  const [supabase, deepseek, anthropic, redis, newsapi, guardian] = await Promise.all([
    timed(async () => {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      const res = await fetch(url)
      return { ok: res.ok, message: `HTTP ${res.status}` }
    }),
    timed(async () => {
      if (!process.env.DEEPSEEK_API_KEY) return { ok: false, message: 'DEEPSEEK_API_KEY not set' }
      const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'deepseek-chat', max_tokens: 5, messages: [{ role: 'user', content: 'ok' }] }),
      })
      const data = await res.json()
      return { ok: res.ok, message: data?.error?.message ?? 'ok' }
    }),
    timed(async () => {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 5, messages: [{ role: 'user', content: 'ok' }] }),
      })
      const data = await res.json()
      return { ok: res.ok, message: data?.error?.message ?? 'ok' }
    }),
    timed(async () => {
      const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/ping`, {
        headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
      })
      const data = await res.json()
      return { ok: res.ok, message: data.result }
    }),
    timed(async () => {
      const res = await fetch(`https://newsapi.org/v2/top-headlines?country=us&pageSize=1&apiKey=${process.env.NEWS_API_KEY}`)
      const data = await res.json()
      return { ok: res.ok && data.status === 'ok', message: data.message ?? data.status }
    }),
    timed(async () => {
      const res = await fetch(`https://content.guardianapis.com/search?api-key=${process.env.GUARDIAN_API_KEY}&page-size=1`)
      const data = await res.json()
      return { ok: res.ok && data.response?.status === 'ok', message: data.response?.status ?? 'error' }
    }),
  ])

  return {
    aiProvider: process.env.DEEPSEEK_API_KEY ? 'deepseek' : 'anthropic',
    supabase, deepseek, anthropic, redis, newsapi, guardian,
  }
}

type UsageRow = {
  provider: string
  model: string
  context: string | null
  input_tokens: number
  output_tokens: number
  success: boolean
  created_at: string
}

async function getUsageStats() {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: last30d, error } = await supabaseAdmin
    .from('ai_usage_log')
    .select('provider, model, context, input_tokens, output_tokens, success, created_at')
    .gte('created_at', since30d)
    .order('created_at', { ascending: false })
    .limit(5000)

  if (error) {
    return { error: error.message, totals: null, byModel: [], byContext: [], byDay: [], recent: [] }
  }

  const rows: UsageRow[] = (last30d ?? []) as unknown as UsageRow[]

  // Aggregati
  const aggregate = (filtered: UsageRow[]) => {
    let inTok = 0, outTok = 0, calls = 0, fails = 0, cost = 0
    for (const r of filtered) {
      inTok += r.input_tokens ?? 0
      outTok += r.output_tokens ?? 0
      calls += 1
      if (!r.success) fails += 1
      cost += tokenCost(r.model, r.input_tokens ?? 0, r.output_tokens ?? 0)
    }
    return { inTok, outTok, calls, fails, cost }
  }

  const today = aggregate(rows.filter((r) => r.created_at >= since24h))
  const week = aggregate(rows.filter((r) => r.created_at >= since7d))
  const month = aggregate(rows)

  // Per modello
  const byModelMap = new Map<string, { calls: number; inTok: number; outTok: number; cost: number }>()
  for (const r of rows) {
    const k = r.model
    const cur = byModelMap.get(k) ?? { calls: 0, inTok: 0, outTok: 0, cost: 0 }
    cur.calls += 1
    cur.inTok += r.input_tokens ?? 0
    cur.outTok += r.output_tokens ?? 0
    cur.cost += tokenCost(r.model, r.input_tokens ?? 0, r.output_tokens ?? 0)
    byModelMap.set(k, cur)
  }
  const byModel = Array.from(byModelMap.entries())
    .map(([model, v]) => ({ model, ...v }))
    .sort((a, b) => b.cost - a.cost)

  // Per context
  const byContextMap = new Map<string, { calls: number; inTok: number; outTok: number; cost: number }>()
  for (const r of rows) {
    const k = r.context ?? 'other'
    const cur = byContextMap.get(k) ?? { calls: 0, inTok: 0, outTok: 0, cost: 0 }
    cur.calls += 1
    cur.inTok += r.input_tokens ?? 0
    cur.outTok += r.output_tokens ?? 0
    cur.cost += tokenCost(r.model, r.input_tokens ?? 0, r.output_tokens ?? 0)
    byContextMap.set(k, cur)
  }
  const byContext = Array.from(byContextMap.entries())
    .map(([context, v]) => ({ context, ...v }))
    .sort((a, b) => b.cost - a.cost)

  // Per giorno (ultimi 7gg)
  const byDayMap = new Map<string, { calls: number; cost: number }>()
  for (const r of rows.filter((x) => x.created_at >= since7d)) {
    const day = r.created_at.slice(0, 10)
    const cur = byDayMap.get(day) ?? { calls: 0, cost: 0 }
    cur.calls += 1
    cur.cost += tokenCost(r.model, r.input_tokens ?? 0, r.output_tokens ?? 0)
    byDayMap.set(day, cur)
  }
  const byDay = Array.from(byDayMap.entries())
    .map(([day, v]) => ({ day, ...v }))
    .sort((a, b) => a.day.localeCompare(b.day))

  return {
    totals: { today, week, month },
    byModel,
    byContext,
    byDay,
    recent: rows.slice(0, 20),
    pricing: PRICING_PER_M,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Statistiche sui feed RSS: legge il pool cachato e raggruppa per source/region/
// country/bias/type. Niente fetch live (sarebbe troppo lento con 125+ feed).
// Un feed e' considerato "sano" se ha almeno 1 articolo nel pool corrente.
// ─────────────────────────────────────────────────────────────────────────────
type CachedArticle = { source: string; pubDate?: string; category?: string; geo?: string }

async function getFeedsStats() {
  // Pool corrente in cache (chiave v5 sincronizzata con lib/rss.ts)
  let cached: CachedArticle[] = []
  try {
    const raw = await cacheGet('nlv_articles_v5')
    if (raw) cached = JSON.parse(raw) as CachedArticle[]
  } catch { /* pool vuoto, prima fetch non ancora avvenuta */ }

  // Conteggio articoli per source
  const articlesBySource = new Map<string, number>()
  for (const a of cached) {
    articlesBySource.set(a.source, (articlesBySource.get(a.source) ?? 0) + 1)
  }

  // Lista feed con stato
  const feedsList = FEEDS.map((f) => ({
    id: f.id,
    source: f.source,
    country: f.country,
    region: f.region,
    type: f.type,
    bias: f.bias,
    reliability: f.reliability,
    url: f.url,
    articlesInCache: articlesBySource.get(f.source) ?? 0,
    healthy: (articlesBySource.get(f.source) ?? 0) > 0,
  }))

  const totalFeeds = FEEDS.length
  const healthyFeeds = feedsList.filter((f) => f.healthy).length
  const failedFeeds = totalFeeds - healthyFeeds

  // Helper di aggregazione su una chiave categorica
  type Dim = 'country' | 'region' | 'type' | 'bias'
  const aggBy = (key: Dim) => {
    const m = new Map<string, { feeds: number; articles: number; healthy: number }>()
    for (const f of feedsList) {
      const k = String(f[key])
      const cur = m.get(k) ?? { feeds: 0, articles: 0, healthy: 0 }
      cur.feeds += 1
      cur.articles += f.articlesInCache
      if (f.healthy) cur.healthy += 1
      m.set(k, cur)
    }
    return Array.from(m.entries())
      .map(([key, v]) => ({ key, ...v }))
      .sort((a, b) => b.articles - a.articles)
  }

  return {
    totalFeeds,
    healthyFeeds,
    failedFeeds,
    totalArticles: cached.length,
    byRegion: aggBy('region'),
    byCountry: aggBy('country'),
    byBias: aggBy('bias'),
    byType: aggBy('type'),
    feeds: feedsList.sort((a, b) => b.articlesInCache - a.articlesInCache),
  }
}

export async function GET(req: NextRequest) {
  const auth = await authorize(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const [health, usage, feeds] = await Promise.all([getHealth(), getUsageStats(), getFeedsStats()])
  return NextResponse.json({ health, usage, feeds, generatedAt: new Date().toISOString() })
}
