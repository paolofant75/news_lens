import GlobeWrapper from './globe-wrapper'
import { fetchArticles } from '../../lib/rss'
import { getCountryOrFallback, CATEGORY_COLORS } from '../../lib/geo-extract'
import { translateBatch } from '../../lib/translate'
import { cookies } from 'next/headers'
import type { CountryPoint } from '../../lib/geo-extract'

export const revalidate = 120

// Tiered geopolitical relevance by country code
const GEO_TIER: Record<string, number> = {
  US: 1.00, CN: 0.95, RU: 0.92, EU: 0.85, UN: 0.82,
  GB: 0.78, DE: 0.75, FR: 0.75, JP: 0.70, IN: 0.68,
  SA: 0.60, TR: 0.58, BR: 0.58, PK: 0.55, IL: 0.62, IR: 0.60,
  UA: 0.65, KR: 0.58, TW: 0.60, SY: 0.55, LB: 0.52,
  CA: 0.55, AU: 0.50, MX: 0.48, AR: 0.45, VE: 0.42,
  EG: 0.45, NG: 0.42, ZA: 0.40, ET: 0.38,
  PL: 0.50, HU: 0.45, SE: 0.42, FI: 0.42,
  AF: 0.45, IQ: 0.48, MM: 0.40, CO: 0.38, ID: 0.40,
}

function geopoliticalWeight(
  reliability: number,
  sourceType: string,
  category: string,
  countryCode: string
): number {
  const geoTier = GEO_TIER[countryCode] ?? 0.35
  const rel = reliability / 10
  const investigativeBonus = ['investigative', 'fact_checking', 'think_tank', 'university'].includes(sourceType) ? 0.2 : 0
  const urgencyBonus = category === 'breaking' ? 0.12 : category === 'conflitti' ? 0.08 : 0
  return Math.min(1.0, Math.max(0.3, geoTier * 0.4 + rel * 0.4 + investigativeBonus + urgencyBonus))
}

// Golden-angle spiral dispersion — deterministic, avoids overlap
function dispersePoint(baseLat: number, baseLng: number, n: number): { lat: number; lng: number } {
  if (n === 0) return { lat: baseLat, lng: baseLng }
  const angle = n * 137.508 * (Math.PI / 180)
  const radius = 1.0 + Math.floor(n / 5) * 0.7
  return {
    lat: Math.max(-85, Math.min(85, baseLat + radius * Math.cos(angle))),
    lng: baseLng + radius * Math.sin(angle),
  }
}

export default async function MappaPage() {
  const cookieStore = await cookies()
  const lang = cookieStore.get('nlv_lang')?.value ?? 'it'

  const all = await fetchArticles()

  const sorted = all
    .filter((a) => a.sourceReliability >= 5.5 && a.geo !== 'mondo')
    .slice(0, 200)

  const sortedTitles = await translateBatch(
    sorted.map((a) => ({ title: a.title, summary: '' })),
    lang
  )
  const sortedT = sorted.map((a, i) => ({
    ...a,
    originalTitle: a.title,
    title: sortedTitles[i]?.title ?? a.title,
  }))

  const countryCount = new Map<string, number>()
  const points: {
    lat: number; lng: number; label: string; code: string
    title: string; originalTitle: string; source: string; link: string; category: string
    color: string; size: number; reliability: number; isPulsing: boolean
  }[] = []

  for (const article of sortedT) {
    const country: CountryPoint = getCountryOrFallback(article.title, article.summary, article.geo)
    if (country.code === 'WO') continue
    const cnt = countryCount.get(country.code) ?? 0
    if (cnt >= 4) continue
    countryCount.set(country.code, cnt + 1)

    const { lat, lng } = dispersePoint(country.lat, country.lng, cnt)
    const size = geopoliticalWeight(article.sourceReliability, article.sourceType, article.category, country.code)

    points.push({
      lat, lng,
      label: country.label,
      code: country.code,
      title: article.title,
      originalTitle: article.originalTitle ?? article.title,
      source: article.source,
      link: article.link,
      category: article.category,
      color: CATEGORY_COLORS[article.category] ?? '#94a3b8',
      size: Math.max(0.3, size),
      reliability: article.sourceReliability,
      isPulsing: article.category === 'breaking' || article.sourceReliability >= 9.0,
    })
    if (points.length >= 100) break
  }

  return <GlobeWrapper points={points} />
}
