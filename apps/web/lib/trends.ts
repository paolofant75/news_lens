import Parser from 'rss-parser'

export type TrendingTopic = {
  title: string
  traffic: string
}

const LANG_TO_GEO: Record<string, string> = {
  it: 'IT', en: 'US', de: 'DE', fr: 'FR',
  es: 'ES', ar: 'SA', ru: 'RU', zh: 'CN', pt: 'BR',
}

const parser = new Parser({ timeout: 5000 })

export async function fetchTrending(lang = 'it'): Promise<TrendingTopic[]> {
  const geo = LANG_TO_GEO[lang] ?? 'IT'
  try {
    const feed = await parser.parseURL(
      `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`
    )
    return feed.items.slice(0, 8).map((item) => ({
      title: item.title ?? '',
      traffic: (item as Record<string, string>)['ht:approx_traffic'] ?? '',
    })).filter((t) => t.title)
  } catch {
    return []
  }
}

export function scoredArticles<T extends {
  title: string; summary: string; pubDate: string
  sourceReliability: number; category: string
}>(articles: T[], trends: TrendingTopic[]): T[] {
  const trendKeywords = trends
    .flatMap((t) => t.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3))

  const categoryWeight: Record<string, number> = {
    breaking: 5, conflitti: 4, politica: 4, economia: 3,
    tecnologia: 3, scienza: 2, salute: 2, ambiente: 2, sport: 1, cultura: 1, cronaca: 1,
  }

  return [...articles].sort((a, b) => {
    const score = (art: T) => {
      const text = (art.title + ' ' + art.summary).toLowerCase()
      const trendMatch = trendKeywords.filter((kw) => text.includes(kw)).length
      const hoursOld = (Date.now() - new Date(art.pubDate).getTime()) / 3600000
      const recency = Math.max(0, 1 - hoursOld / 12)
      const reliability = art.sourceReliability / 10
      const catScore = (categoryWeight[art.category] ?? 1) / 5
      return trendMatch * 4 + recency * 3 + reliability * 2 + catScore
    }
    return score(b) - score(a)
  })
}
