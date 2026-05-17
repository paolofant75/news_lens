import Parser from 'rss-parser'
import { cacheGet, cacheSet, cacheDel } from './redis'
import { isWorldEligible, worldTierBoost, capByCountry } from './world-filter'

export type TrendingTopic = {
  title: string
  traffic: string
}

const TRENDS_CACHE_TTL = 900 // 15 minuti
function trendsCacheKey(lang: string): string {
  return `trends:${lang}`
}

export async function invalidateTrendsCache(lang?: string): Promise<void> {
  if (lang) {
    await cacheDel(trendsCacheKey(lang)).catch(() => {})
    return
  }
  // Nessuna lingua specificata -> invalida le piu' comuni
  await Promise.all(['it', 'en', 'fr', 'de', 'es'].map((l) => cacheDel(trendsCacheKey(l)).catch(() => {})))
}

const LANG_TO_GEO: Record<string, string> = {
  it: 'IT', en: 'US', de: 'DE', fr: 'FR',
  es: 'ES', ar: 'SA', ru: 'RU', zh: 'CN', pt: 'BR',
}

// ISO 3166-1 alpha-2 → geo slug used in articles
const COUNTRY_TO_GEO: Record<string, string> = {
  // Europa
  IT: 'europa', DE: 'europa', FR: 'europa', GB: 'europa', ES: 'europa',
  PL: 'europa', NL: 'europa', BE: 'europa', SE: 'europa', NO: 'europa',
  FI: 'europa', DK: 'europa', AT: 'europa', CH: 'europa', PT: 'europa',
  CZ: 'europa', RO: 'europa', HU: 'europa', GR: 'europa', UA: 'europa',
  RU: 'europa',
  // Americhe
  US: 'americhe', CA: 'americhe', MX: 'americhe', BR: 'americhe',
  AR: 'americhe', CL: 'americhe', CO: 'americhe', PE: 'americhe',
  VE: 'americhe', CU: 'americhe',
  // Asia
  CN: 'asia', JP: 'asia', IN: 'asia', KR: 'asia', TW: 'asia',
  SG: 'asia', TH: 'asia', VN: 'asia', ID: 'asia', PH: 'asia',
  MY: 'asia', PK: 'asia', BD: 'asia', AF: 'asia', MM: 'asia',
  KZ: 'asia', UZ: 'asia',
  // Medio Oriente
  SA: 'medio-oriente', IR: 'medio-oriente', IL: 'medio-oriente',
  IQ: 'medio-oriente', SY: 'medio-oriente', LB: 'medio-oriente',
  AE: 'medio-oriente', QA: 'medio-oriente', KW: 'medio-oriente',
  JO: 'medio-oriente', YE: 'medio-oriente', TR: 'medio-oriente',
  // Africa
  NG: 'africa', ZA: 'africa', EG: 'africa', ET: 'africa', KE: 'africa',
  GH: 'africa', TZ: 'africa', MA: 'africa', TN: 'africa', DZ: 'africa',
  SD: 'africa', SO: 'africa', ML: 'africa', NE: 'africa',
  // Oceania
  AU: 'oceania', NZ: 'oceania', PG: 'oceania', FJ: 'oceania',
}

const parser = new Parser({ timeout: 5000 })

export async function fetchTrending(lang = 'it'): Promise<TrendingTopic[]> {
  const key = trendsCacheKey(lang)
  // 1. Cache hit -> ritorna risultati stabili per 15 minuti
  try {
    const cached = await cacheGet(key)
    if (cached) return JSON.parse(cached) as TrendingTopic[]
  } catch { /* fall through */ }

  // 2. Cold fetch dal RSS di Google Trends
  const geo = LANG_TO_GEO[lang] ?? 'IT'
  try {
    const feed = await parser.parseURL(
      `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`
    )
    const trends = feed.items.slice(0, 8).map((item) => ({
      title: item.title ?? '',
      traffic: (item as Record<string, string>)['ht:approx_traffic'] ?? '',
    })).filter((t) => t.title)
    cacheSet(key, JSON.stringify(trends), TRENDS_CACHE_TTL).catch(() => {})
    return trends
  } catch {
    return []
  }
}

export function geoPersonalizedArticles<T extends {
  title: string; summary: string; pubDate: string; link: string
  sourceReliability: number; category: string
  geo: string; sourceBias: string
  // Campi opzionali popolati da fetchArticlesFresh dopo la migrazione scope/tier (lib/rss.ts)
  sourceScope?: 'local' | 'national' | 'international'
  sourceCountry?: string
  sourceGlobalTier?: 1 | 2 | 3
}>(
  articles: T[],
  trends: TrendingTopic[],
  visitorCountry: string | null,
  options: {
    globalRatio?: number
    maxPerCategory?: number
    // worldMode: applica isWorldEligible (esclude local, ammette national solo se highimpact)
    // + boost moltiplicativo per fonti tier-1 (×1.4) e tier-2 (×1.15)
    // + cap soft per sourceCountry (default 8 articoli/paese)
    worldMode?: boolean
    maxPerCountry?: number
  } = {}
): T[] {
  const {
    globalRatio = 0.5,
    maxPerCategory = 5,
    worldMode = false,
    maxPerCountry = 8,
  } = options
  const visitorGeo = visitorCountry ? (COUNTRY_TO_GEO[visitorCountry] ?? null) : null

  // worldMode: filtro editoriale a monte. Le notizie locali (ANSA regionali) escono qui,
  // le nazionali italiane senza impatto globale anche. Vedi lib/world-filter.ts.
  const eligible: T[] = worldMode ? articles.filter(isWorldEligible) : articles

  // Base scoring with sensationalism penalty
  const trendKeywords = trends
    .flatMap((t) => t.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3))
  const categoryWeight: Record<string, number> = {
    breaking: 5, conflitti: 4, politica: 4, economia: 3,
    tecnologia: 3, scienza: 2, salute: 2, ambiente: 2, sport: 1, cultura: 1, cronaca: 1,
    // worldMode: 'esteri' deve ricevere lo stesso peso di politica/conflitti
    esteri: 4,
  }

  // Bucket di recency per "ore" invece di ms: due articoli pubblicati nella
  // stessa ora ottengono lo stesso recency -> niente shuffle al secondo
  const NOW_HOUR = Math.floor(Date.now() / 3600000)

  const withScore = eligible.map((art) => {
    const text = (art.title + ' ' + art.summary).toLowerCase()
    const trendMatch = trendKeywords.filter((kw) => text.includes(kw)).length
    const pubHour = Math.floor(new Date(art.pubDate).getTime() / 3600000)
    const hoursOld = Math.max(0, NOW_HOUR - pubHour)
    const recency = Math.max(0, 1 - hoursOld / 12)
    const reliability = art.sourceReliability / 10
    const catScore = (categoryWeight[art.category] ?? 1) / 5
    const sensationalPenalty = art.sourceBias === 'state-aligned' ? 0.7 : 1.0
    // Tier boost solo in worldMode: Reuters/BBC/AP ×1.4, ANSA Mondo / NYT World / La Presse Int ×1.15
    const tierBoost = worldMode ? worldTierBoost(art) : 1.0
    const baseScore = (trendMatch * 4 + recency * 3 + reliability * 2 + catScore) * sensationalPenalty * tierBoost
    const isRegional = visitorGeo ? art.geo === visitorGeo : false
    return { art, baseScore, isRegional }
  }).sort((a, b) => {
    if (b.baseScore !== a.baseScore) return b.baseScore - a.baseScore
    // Tiebreak deterministico: stessa coppia di articoli con stesso score
    // -> stesso ordine sempre (no shuffle JS engine-dependent)
    return a.art.link.localeCompare(b.art.link)
  })

  // If no visitor geo, just return base-sorted with category cap (+ country cap in worldMode)
  if (!visitorGeo) {
    const catCount: Record<string, number> = {}
    const ordered = withScore
      .filter(({ art }) => {
        const c = catCount[art.category] ?? 0
        if (c >= maxPerCategory) return false
        catCount[art.category] = c + 1
        return true
      })
      .map(({ art }) => art)
    return worldMode ? capByCountry(ordered, maxPerCountry, (a) => a.sourceCountry ?? '') : ordered
  }

  // Partition: regional vs global
  const regional = withScore.filter((x) => x.isRegional).map((x) => x.art)
  const global = withScore.filter((x) => !x.isRegional).map((x) => x.art)

  // Interleave: for every globalRatio slots of global, add (1-globalRatio) slots of regional
  const result: T[] = []
  const catCount: Record<string, number> = {}
  let gi = 0, ri = 0
  const total = withScore.length

  for (let i = 0; i < total; i++) {
    const useGlobal = ri >= regional.length || (gi / Math.max(1, gi + ri) < globalRatio && gi < global.length)
    const pool = useGlobal ? global : regional
    const idx = useGlobal ? gi : ri

    if (idx >= pool.length) {
      const fallback = useGlobal ? regional : global
      const fi = useGlobal ? ri : gi
      if (fi < fallback.length) {
        const art = fallback[fi]
        const c = catCount[art.category] ?? 0
        if (c < maxPerCategory) { catCount[art.category] = c + 1; result.push(art) }
        if (useGlobal) ri++; else gi++
      }
      continue
    }

    const art = pool[idx]
    const c = catCount[art.category] ?? 0
    if (c < maxPerCategory) { catCount[art.category] = c + 1; result.push(art) }
    if (useGlobal) gi++; else ri++
  }

  return worldMode ? capByCountry(result, maxPerCountry, (a) => a.sourceCountry ?? '') : result
}

export function scoredArticles<T extends {
  title: string; summary: string; pubDate: string; link: string
  sourceReliability: number; category: string
}>(articles: T[], trends: TrendingTopic[]): T[] {
  const trendKeywords = trends
    .flatMap((t) => t.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3))

  const categoryWeight: Record<string, number> = {
    breaking: 5, conflitti: 4, politica: 4, economia: 3,
    tecnologia: 3, scienza: 2, salute: 2, ambiente: 2, sport: 1, cultura: 1, cronaca: 1,
  }

  const NOW_HOUR = Math.floor(Date.now() / 3600000)
  const score = (art: T) => {
    const text = (art.title + ' ' + art.summary).toLowerCase()
    const trendMatch = trendKeywords.filter((kw) => text.includes(kw)).length
    const pubHour = Math.floor(new Date(art.pubDate).getTime() / 3600000)
    const hoursOld = Math.max(0, NOW_HOUR - pubHour)
    const recency = Math.max(0, 1 - hoursOld / 12)
    const reliability = art.sourceReliability / 10
    const catScore = (categoryWeight[art.category] ?? 1) / 5
    return trendMatch * 4 + recency * 3 + reliability * 2 + catScore
  }

  return [...articles].sort((a, b) => {
    const sa = score(a)
    const sb = score(b)
    if (sb !== sa) return sb - sa
    return a.link.localeCompare(b.link)
  })
}
