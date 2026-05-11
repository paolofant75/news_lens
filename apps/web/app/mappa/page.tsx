import GlobeClient from './globe-client'
import { fetchArticles } from '../../lib/rss'
import { getCountryOrFallback, CATEGORY_COLORS } from '../../lib/geo-extract'

export const revalidate = 300

export default async function MappaPage() {
  const all = await fetchArticles()

  // Prendi le notizie con importanza globale (alta reliability)
  const sorted = all
    .filter((a) => a.sourceReliability >= 7.0)
    .slice(0, 60)

  // Costruisci i punti globo — deduplica per Paese
  const usedCountries = new Set<string>()
  const points: {
    lat: number; lng: number; label: string; code: string
    title: string; source: string; link: string; category: string
    color: string; size: number; reliability: number
  }[] = []

  for (const article of sorted) {
    const country = getCountryOrFallback(article.title, article.summary, article.geo)
    const key = `${country.code}-${article.category}`

    if (!usedCountries.has(key)) {
      usedCountries.add(key)
      points.push({
        lat: country.lat + (Math.random() - 0.5) * 2,
        lng: country.lng + (Math.random() - 0.5) * 2,
        label: country.label,
        code: country.code,
        title: article.title,
        source: article.source,
        link: article.link,
        category: article.category,
        color: CATEGORY_COLORS[article.category] ?? '#94a3b8',
        size: Math.max(0.4, article.sourceReliability / 15),
        reliability: article.sourceReliability,
      })
    }

    if (points.length >= 30) break
  }

  return <GlobeClient points={points} />
}
