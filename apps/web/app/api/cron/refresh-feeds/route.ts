import { NextRequest, NextResponse } from 'next/server'
import { fetchArticlesFresh } from '../../../../lib/rss'
import { cacheSet } from '../../../../lib/redis'

// v4: deve combaciare con la chiave usata in lib/rss.ts
const ARTICLES_FRESH_KEY = 'nlv_articles_v4'
const ARTICLES_STALE_KEY = 'nlv_articles_v4_stale'
const ARTICLES_CACHE_TTL = 600
const ARTICLES_STALE_TTL = 1800

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const articles = await fetchArticlesFresh()
  await Promise.all([
    cacheSet(ARTICLES_FRESH_KEY, JSON.stringify(articles), ARTICLES_CACHE_TTL),
    cacheSet(ARTICLES_STALE_KEY, JSON.stringify(articles), ARTICLES_STALE_TTL),
  ])
  return NextResponse.json({ ok: true, count: articles.length })
}
