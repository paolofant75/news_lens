import { fetchArticlesFresh } from '../../../lib/rss'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  const start = Date.now()
  const articles = await fetchArticlesFresh()
  const ms = Date.now() - start

  return Response.json({
    ok: true,
    articles: articles.length,
    ms,
    ts: new Date().toISOString(),
  })
}
