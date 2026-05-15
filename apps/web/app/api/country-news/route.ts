import { NextRequest, NextResponse } from 'next/server'
import { cacheGet, cacheSet } from '../../../lib/redis'
import { COUNTRIES } from '../../../lib/countries'
import { classifyArticle, geoClassify } from '../../../lib/classify'
import { articleId } from '../../../lib/encode'

const TTL = 3600 // 1 ora
const ARTICLE_BY_ID_TTL = 86400 // 24h: cache singolo articolo per lookup da URL

async function searchCountry(terms: string[]): Promise<{title:string;link:string;pubDate:string;source:string;summary:string}[]> {
  const query = terms[0]
  const results: {title:string;link:string;pubDate:string;source:string;summary:string}[] = []

  // NewsAPI
  try {
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=6&sortBy=publishedAt&language=en&apiKey=${process.env.NEWS_API_KEY}`
    )
    const data = await res.json()
    if (data.status === 'ok') {
      data.articles
        .filter((a: {title?:string;url?:string}) => a.title && a.url && a.title !== '[Removed]')
        .slice(0, 5)
        .forEach((a: {title:string;url:string;publishedAt:string;source:{name:string};description?:string}) => {
          results.push({ title: a.title, link: a.url, pubDate: a.publishedAt, source: a.source.name, summary: a.description ?? '' })
        })
    }
  } catch {}

  // Guardian
  try {
    const res = await fetch(
      `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&api-key=${process.env.GUARDIAN_API_KEY}&page-size=5&show-fields=trailText`
    )
    const data = await res.json()
    if (data.response?.status === 'ok') {
      data.response.results.slice(0, 4).forEach((a: {webTitle:string;webUrl:string;webPublicationDate:string;fields?:{trailText?:string}}) => {
        results.push({ title: a.webTitle, link: a.webUrl, pubDate: a.webPublicationDate, source: 'The Guardian', summary: a.fields?.trailText ?? '' })
      })
    }
  } catch {}

  return results.slice(0, 8)
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.toUpperCase()
  if (!code) return NextResponse.json({ error: 'Missing country code' }, { status: 400 })

  const country = COUNTRIES.find((c) => c.code === code)
  if (!country) return NextResponse.json({ error: 'Unknown country' }, { status: 404 })

  const cacheKey = `country-news:${code}`
  const cached = await cacheGet(cacheKey)
  if (cached) {
    return NextResponse.json({ cached: true, articles: JSON.parse(cached), country: country.nameIt })
  }

  const articles = await searchCountry(country.searchTerms)
  const enriched = articles.map((a) => ({
    id: articleId(a.link),
    ...a,
    category: classifyArticle(a.title, a.summary).category,
    geo: geoClassify(a.title, a.summary),
  }))

  // Cache singolo articolo per consentire alla pagina /articolo/<id> di trovare
  // il titolo nella lingua di pubblicazione della fonte
  for (const a of enriched) {
    cacheSet(`art:${a.id}`, JSON.stringify(a), ARTICLE_BY_ID_TTL).catch(() => {})
  }

  await cacheSet(cacheKey, JSON.stringify(enriched), TTL)
  return NextResponse.json({ cached: false, articles: enriched, country: country.nameIt })
}
