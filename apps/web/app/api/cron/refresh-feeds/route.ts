import { NextRequest, NextResponse } from 'next/server'
import { fetchArticlesFresh } from '../../../../lib/rss'
import { cacheSet } from '../../../../lib/redis'

// v6: deve combaciare con la chiave usata in lib/rss.ts
const ARTICLES_FRESH_KEY = 'nlv_articles_v6'
const ARTICLES_CACHE_TTL = 1800  // 30 min (aumentato da 600)

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const articles = await fetchArticlesFresh()
  // Una sola write (ARTICLES_STALE_KEY rimosso per ridurre comandi)
  await cacheSet(ARTICLES_FRESH_KEY, JSON.stringify(articles), ARTICLES_CACHE_TTL)
  return NextResponse.json({ ok: true, count: articles.length })
}
