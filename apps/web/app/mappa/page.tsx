import GlobeClient from './globe-client'
import { fetchArticles } from '../../lib/rss'
import { getCountryOrFallback, CATEGORY_COLORS } from '../../lib/geo-extract'
import { translateBatch } from '../../lib/translate'
import { cookies } from 'next/headers'

export const revalidate = 120

export default async function MappaPage() {
  const cookieStore = await cookies()
  const lang = cookieStore.get('nlv_lang')?.value ?? 'it'

  const all = await fetchArticles()

  // Prendi le notizie con importanza globale (alta reliability)
  const sorted = all
    .filter((a) => a.sourceReliability >= 5.5 && a.geo !== 'mondo')
    .slice(0, 120)

  // Traduci i titoli per il globo
  const sortedTitles = await translateBatch(
    sorted.map((a) => ({ title: a.title, summary: '' })),
    lang
  )
  const sortedT = sorted.map((a, i) => ({
    ...a,
    originalTitle: a.title,
    title: sortedTitles[i]?.title ?? a.title,
  }))

  // Costruisci i punti globo — max 3 per paese per avere più diversità
  const countryCount = new Map<string, number>()
  const points: {
    lat: number; lng: number; label: string; code: string
    title: string; originalTitle: string; source: string; link: string; category: string
    color: string; size: number; reliability: number
  }[] = []

  for (const article of sortedT) {
    const country = getCountryOrFallback(article.title, article.summary, article.geo)
    if (country.code === 'WO') continue // salta 'mondo' senza paese specifico
    const cnt = countryCount.get(country.code) ?? 0
    if (cnt >= 3) continue // max 3 notizie per paese
    countryCount.set(country.code, cnt + 1)
    points.push({
      lat: country.lat + (Math.random() - 0.5) * 3,
      lng: country.lng + (Math.random() - 0.5) * 3,
      label: country.label,
      code: country.code,
      title: article.title,
      originalTitle: article.originalTitle ?? article.title,
      source: article.source,
      link: article.link,
      category: article.category,
      color: CATEGORY_COLORS[article.category] ?? '#94a3b8',
      size: Math.max(0.5, article.sourceReliability / 10),
      reliability: article.sourceReliability,
    })
    if (points.length >= 60) break
  }

  return <GlobeClient points={points} />
}
