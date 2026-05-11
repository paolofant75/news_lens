import Parser from 'rss-parser'

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
}

const FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml',       source: 'BBC News' },
  { url: 'https://www.theguardian.com/world/rss',             source: 'The Guardian' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml',         source: 'Al Jazeera' },
  { url: 'https://feeds.npr.org/1001/rss.xml',                source: 'NPR' },
  { url: 'https://rss.dw.com/xml/rss-en-world',               source: 'Deutsche Welle' },
  { url: 'https://www.france24.com/en/rss',                   source: 'France 24' },
  { url: 'https://feeds.feedburner.com/ndtvnews-top-stories',  source: 'NDTV' },
  { url: 'https://www.ansa.it/sito/notizie/mondo/mondo_rss.xml', source: 'ANSA' },
]

export async function fetchArticles(): Promise<Article[]> {
  const results = await Promise.allSettled(
    FEEDS.map(async ({ url, source }) => {
      const feed = await parser.parseURL(url)
      return feed.items.slice(0, 10).map((item) => ({
        title: item.title ?? '',
        link: item.link ?? '',
        pubDate: item.pubDate ?? item.isoDate ?? '',
        source,
        summary: item.contentSnippet ?? item.summary ?? '',
      }))
    })
  )

  const articles = results
    .filter((r): r is PromiseFulfilledResult<Article[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .filter((a) => a.title && a.link)

  articles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())

  return articles
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min} min fa`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h fa`
  return `${Math.floor(h / 24)}g fa`
}
