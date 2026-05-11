import Parser from 'rss-parser'
import { classifyArticle, geoClassify } from './classify'

const parser = new Parser({
  timeout: 8000,
  headers: { 'User-Agent': 'NewsLensVeritas/1.0' },
})

export type FeedMeta = {
  id: string
  source: string
  url: string
  country: string
  region: string
  type: string
  bias: string
  reliability: number
  aiValue: string
  antiBiasValue: string
}

export type Article = {
  title: string
  link: string
  pubDate: string
  source: string
  summary: string
  category: string
  geo: string
  // Metadati fonte
  sourceBias: string
  sourceReliability: number
  sourceType: string
}

const FEEDS: FeedMeta[] = [
  // Agenzie / Mainstream globali
  { id: 'bbc_world',      source: 'BBC World News',          url: 'http://feeds.bbci.co.uk/news/world/rss.xml',              country: 'UK',            region: 'europe',     type: 'mainstream',    bias: 'center',        reliability: 8.8, aiValue: 'high', antiBiasValue: 'high' },
  { id: 'reuters_world',  source: 'Reuters',                 url: 'https://feeds.reuters.com/Reuters/worldNews',             country: 'USA',           region: 'americhe',   type: 'mainstream',    bias: 'center',        reliability: 9.2, aiValue: 'high', antiBiasValue: 'high' },
  { id: 'ap_news',        source: 'Associated Press',        url: 'https://apnews.com/hub/ap-top-news/rss.xml',              country: 'USA',           region: 'americhe',   type: 'mainstream',    bias: 'center',        reliability: 9.0, aiValue: 'high', antiBiasValue: 'high' },
  { id: 'al_jazeera',     source: 'Al Jazeera',              url: 'https://www.aljazeera.com/xml/rss/all.xml',               country: 'Qatar',         region: 'medio-oriente', type: 'mainstream', bias: 'mixed',        reliability: 8.0, aiValue: 'high', antiBiasValue: 'high' },
  { id: 'dw_world',       source: 'Deutsche Welle',          url: 'https://rss.dw.com/xml/rss-en-all',                       country: 'Germany',       region: 'europa',     type: 'government',    bias: 'center',        reliability: 8.5, aiValue: 'high', antiBiasValue: 'high' },
  { id: 'france24',       source: 'France 24',               url: 'https://www.france24.com/en/rss',                         country: 'France',        region: 'europa',     type: 'government',    bias: 'center',        reliability: 8.3, aiValue: 'high', antiBiasValue: 'high' },
  { id: 'guardian_world', source: 'The Guardian',            url: 'https://www.theguardian.com/world/rss',                   country: 'UK',            region: 'europa',     type: 'mainstream',    bias: 'center-left',   reliability: 8.4, aiValue: 'high', antiBiasValue: 'high' },
  { id: 'nyt_world',      source: 'New York Times',          url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',  country: 'USA',           region: 'americhe',   type: 'mainstream',    bias: 'center-left',   reliability: 8.7, aiValue: 'high', antiBiasValue: 'high' },
  { id: 'scmp',           source: 'South China Morning Post',url: 'https://www.scmp.com/rss/91/feed',                        country: 'Hong Kong',     region: 'asia',       type: 'mainstream',    bias: 'mixed',         reliability: 7.8, aiValue: 'high', antiBiasValue: 'high' },
  { id: 'rt_world',       source: 'RT News',                 url: 'https://www.rt.com/rss/news/',                            country: 'Russia',        region: 'europa',     type: 'government',    bias: 'state-aligned', reliability: 5.0, aiValue: 'high', antiBiasValue: 'high' },
  // Tecnologia
  { id: 'ars_technica',   source: 'Ars Technica',            url: 'http://feeds.arstechnica.com/arstechnica/index',          country: 'USA',           region: 'americhe',   type: 'independent',   bias: 'center-left',   reliability: 8.8, aiValue: 'high', antiBiasValue: 'medium' },
  { id: 'techcrunch',     source: 'TechCrunch',              url: 'https://techcrunch.com/feed/',                            country: 'USA',           region: 'americhe',   type: 'mainstream',    bias: 'center-left',   reliability: 7.8, aiValue: 'high', antiBiasValue: 'medium' },
  { id: 'mit_tech',       source: 'MIT Technology Review',   url: 'https://www.technologyreview.com/feed/',                  country: 'USA',           region: 'americhe',   type: 'university',    bias: 'center',        reliability: 9.0, aiValue: 'high', antiBiasValue: 'high' },
  { id: 'wired',          source: 'WIRED',                   url: 'https://www.wired.com/feed/rss',                          country: 'USA',           region: 'americhe',   type: 'mainstream',    bias: 'center-left',   reliability: 8.0, aiValue: 'high', antiBiasValue: 'medium' },
  // Cybersecurity
  { id: 'hacker_news',    source: 'The Hacker News',         url: 'https://feeds.feedburner.com/TheHackersNews',             country: 'India',         region: 'asia',       type: 'independent',   bias: 'center',        reliability: 8.2, aiValue: 'high', antiBiasValue: 'medium' },
  { id: 'bleeping',       source: 'BleepingComputer',        url: 'https://www.bleepingcomputer.com/feed/',                  country: 'USA',           region: 'americhe',   type: 'independent',   bias: 'center',        reliability: 8.7, aiValue: 'high', antiBiasValue: 'medium' },
  // Investigative / Fact-checking
  { id: 'bellingcat',     source: 'Bellingcat',              url: 'https://www.bellingcat.com/feed/',                        country: 'Netherlands',   region: 'europa',     type: 'investigative', bias: 'center-left',   reliability: 8.8, aiValue: 'high', antiBiasValue: 'high' },
  { id: 'snopes',         source: 'Snopes',                  url: 'https://www.snopes.com/feed/',                            country: 'USA',           region: 'americhe',   type: 'fact_checking', bias: 'center-left',   reliability: 8.5, aiValue: 'high', antiBiasValue: 'high' },
  { id: 'politifact',     source: 'PolitiFact',              url: 'https://www.politifact.com/rss/all/',                     country: 'USA',           region: 'americhe',   type: 'fact_checking', bias: 'center',        reliability: 8.6, aiValue: 'high', antiBiasValue: 'high' },
  // Think tank / Policy
  { id: 'brookings',      source: 'Brookings Institution',   url: 'https://www.brookings.edu/feed/',                        country: 'USA',           region: 'americhe',   type: 'think_tank',    bias: 'center-left',   reliability: 9.0, aiValue: 'high', antiBiasValue: 'high' },
  { id: 'rand',           source: 'RAND Corporation',        url: 'https://www.rand.org/topics.rss.xml',                     country: 'USA',           region: 'americhe',   type: 'think_tank',    bias: 'center',        reliability: 9.1, aiValue: 'high', antiBiasValue: 'high' },
  // Crypto / Finance
  { id: 'cointelegraph',  source: 'Cointelegraph',           url: 'https://cointelegraph.com/rss',                           country: 'Global',        region: 'mondo',      type: 'independent',   bias: 'mixed',         reliability: 7.0, aiValue: 'medium', antiBiasValue: 'medium' },
  // Scienza / Salute
  { id: 'nasa_news',      source: 'NASA',                    url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',          country: 'USA',           region: 'americhe',   type: 'government',    bias: 'center',        reliability: 9.5, aiValue: 'high', antiBiasValue: 'high' },
  { id: 'who_news',       source: 'WHO',                     url: 'https://www.who.int/feeds/entity/news/en/rss.xml',        country: 'International', region: 'mondo',      type: 'government',    bias: 'center',        reliability: 9.3, aiValue: 'high', antiBiasValue: 'high' },
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
          title, link: a.url, pubDate: a.publishedAt,
          source: a.source.name, summary,
          category: categorize(title, summary),
          geo: geoClassify(title, summary),
          sourceBias: 'unknown', sourceReliability: 7.0, sourceType: 'mainstream',
        }
      })
  } catch { return [] }
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
        title, link: a.webUrl, pubDate: a.webPublicationDate,
        source: 'The Guardian', summary,
        category: categorize(title, summary),
        geo: geoClassify(title, summary),
        sourceBias: 'center-left', sourceReliability: 8.4, sourceType: 'mainstream',
      }
    })
  } catch { return [] }
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
        title, link: a.url, pubDate: a.publishedAt,
        source: a.source.name, summary,
        category: categorize(title, summary),
        geo: geoClassify(title, summary),
        sourceBias: 'unknown', sourceReliability: 7.0, sourceType: 'mainstream',
      }
    })
  } catch { return [] }
}

export async function fetchArticles(): Promise<Article[]> {
  const [rssResults, newsApiArticles, guardianArticles, gnewsArticles] = await Promise.all([
    Promise.allSettled(
      FEEDS.map(async (feed) => {
        const f = await parser.parseURL(feed.url)
        return f.items.slice(0, 12).map((item) => {
          const title = item.title ?? ''
          const summary = item.contentSnippet ?? item.summary ?? ''
          return {
            title,
            link: item.link ?? '',
            pubDate: item.pubDate ?? item.isoDate ?? '',
            source: feed.source,
            summary,
            category: categorize(title, summary),
            geo: geoClassify(title, summary),
            sourceBias: feed.bias,
            sourceReliability: feed.reliability,
            sourceType: feed.type,
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

  const seen = new Set<string>()
  return all
    .filter((a) => {
      const key = a.title.toLowerCase().slice(0, 60)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min}m fa`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h fa`
  return `${Math.floor(h / 24)}g fa`
}

export function biasColor(bias: string): string {
  const map: Record<string, string> = {
    'center': 'text-green-400',
    'center-left': 'text-blue-400',
    'center-right': 'text-orange-400',
    'left': 'text-blue-600',
    'right': 'text-red-500',
    'state-aligned': 'text-red-400',
    'mixed': 'text-yellow-400',
    'unknown': 'text-gray-400',
  }
  return map[bias] ?? 'text-gray-400'
}
