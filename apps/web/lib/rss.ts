import Parser from 'rss-parser'
import { classifyArticle, geoClassify } from './classify'

const parser = new Parser({
  timeout: 8000,
  headers: { 'User-Agent': 'NewsLensVeritas/1.0' },
})

export type Article = {
  title: string
  link: string
  pubDate: string
  source: string
  summary: string
  category: string
  geo: string
}

const RSS_FEEDS = [
  // Anglosfera
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml',               source: 'BBC News' },
  { url: 'https://feeds.bbci.co.uk/news/uk/rss.xml',                  source: 'BBC UK' },
  { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',          source: 'BBC Tech' },
  { url: 'https://www.theguardian.com/world/rss',                     source: 'The Guardian' },
  { url: 'https://www.theguardian.com/technology/rss',                source: 'Guardian Tech' },
  { url: 'https://feeds.npr.org/1001/rss.xml',                        source: 'NPR' },
  // Medio Oriente
  { url: 'https://www.aljazeera.com/xml/rss/all.xml',                 source: 'Al Jazeera' },
  // Europa
  { url: 'https://rss.dw.com/xml/rss-en-world',                      source: 'Deutsche Welle' },
  { url: 'https://www.france24.com/en/rss',                          source: 'France 24' },
  { url: 'https://www.spiegel.de/international/index.rss',           source: 'Der Spiegel' },
  { url: 'https://www.lemonde.fr/rss/une.xml',                       source: 'Le Monde' },
  { url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/english.elpais.com/portada', source: 'El País' },
  // Italia
  { url: 'https://www.ansa.it/sito/notizie/mondo/mondo_rss.xml',     source: 'ANSA Mondo' },
  { url: 'https://www.ansa.it/sito/notizie/topnews/topnews_rss.xml', source: 'ANSA Top' },
  { url: 'https://www.corriere.it/rss/homepage.xml',                 source: 'Corriere della Sera' },
  { url: 'https://www.repubblica.it/rss/homepage/rss2.0.xml',       source: 'La Repubblica' },
  // Asia
  { url: 'https://www3.nhk.or.jp/rss/news/cat0.xml',                source: 'NHK World' },
  { url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', source: 'Times of India' },
  { url: 'https://feeds.feedburner.com/ndtvnews-top-stories',        source: 'NDTV' },
  // America Latina
  { url: 'https://rss.folha.uol.com.br/mundo/rss091.xml',           source: 'Folha de S.Paulo' },
]

function categorize(title: string, summary: string): string {
  return classifyArticle(title, summary).category
}

async function fetchFromNewsAPI(): Promise<Article[]> {
  try {
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?pageSize=30&language=en&apiKey=${process.env.NEWS_API_KEY}`,
      { next: { revalidate: 300 } }
    )
    const data = await res.json()
    if (data.status !== 'ok') return []
    return data.articles
      .filter((a: { title?: string; url?: string }) => a.title && a.url && a.title !== '[Removed]')
      .map((a: { title: string; url: string; publishedAt: string; source: { name: string }; description?: string }) => {
        const title = a.title
        const summary = a.description ?? ''
        return {
          title,
          link: a.url,
          pubDate: a.publishedAt,
          source: a.source.name,
          summary,
          category: categorize(title, summary),
          geo: geoClassify(title, summary),
        }
      })
  } catch {
    return []
  }
}

async function fetchFromGuardianAPI(): Promise<Article[]> {
  try {
    const res = await fetch(
      `https://content.guardianapis.com/search?api-key=${process.env.GUARDIAN_API_KEY}&page-size=30&order-by=newest&show-fields=trailText`,
      { next: { revalidate: 300 } }
    )
    const data = await res.json()
    if (data.response?.status !== 'ok') return []
    return data.response.results.map((a: { webTitle: string; webUrl: string; webPublicationDate: string; fields?: { trailText?: string } }) => {
      const title = a.webTitle
      const summary = a.fields?.trailText ?? ''
      return {
        title,
        link: a.webUrl,
        pubDate: a.webPublicationDate,
        source: 'The Guardian',
        summary,
        category: categorize(title, summary),
        geo: geoClassify(title, summary),
      }
    })
  } catch {
    return []
  }
}

async function fetchFromGNews(): Promise<Article[]> {
  try {
    const res = await fetch(
      `https://gnews.io/api/v4/top-headlines?token=${process.env.GNEWS_API_KEY}&max=20&lang=en`,
      { next: { revalidate: 300 } }
    )
    const data = await res.json()
    if (!data.articles) return []
    return data.articles.map((a: { title: string; url: string; publishedAt: string; source: { name: string }; description?: string }) => {
      const title = a.title
      const summary = a.description ?? ''
      return {
        title,
        link: a.url,
        pubDate: a.publishedAt,
        source: a.source.name,
        summary,
        category: categorize(title, summary),
        geo: geoClassify(title, summary),
      }
    })
  } catch {
    return []
  }
}

export async function fetchArticles(): Promise<Article[]> {
  const [rssResults, newsApiArticles, guardianArticles, gnewsArticles] = await Promise.all([
    Promise.allSettled(
      RSS_FEEDS.map(async ({ url, source }) => {
        const feed = await parser.parseURL(url)
        return feed.items.slice(0, 15).map((item) => {
          const title = item.title ?? ''
          const summary = item.contentSnippet ?? item.summary ?? ''
          return {
            title,
            link: item.link ?? '',
            pubDate: item.pubDate ?? item.isoDate ?? '',
            source,
            summary,
            category: categorize(title, summary),
            geo: geoClassify(title, summary),
          }
        })
      })
    ),
    fetchFromNewsAPI(),
    fetchFromGuardianAPI(),
    fetchFromGNews(),
  ])

  const rssArticles = rssResults
    .filter((r): r is PromiseFulfilledResult<Article[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)

  const all = [...rssArticles, ...newsApiArticles, ...guardianArticles, ...gnewsArticles]
    .filter((a) => a.title && a.link)

  // Deduplica per titolo simile
  const seen = new Set<string>()
  const deduped = all.filter((a) => {
    const key = a.title.toLowerCase().slice(0, 60)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return deduped.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min} min fa`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h fa`
  return `${Math.floor(h / 24)}g fa`
}
