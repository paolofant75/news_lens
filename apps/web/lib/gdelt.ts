// ─────────────────────────────────────────────────────────────────────────────
// GDELT Project — Integrazione fonte news aggiuntiva
// API pubblica gratuita: https://api.gdeltproject.org/api/v2/doc/doc
// Aggiornata ogni 15 minuti, copertura globale multilingua.
// ─────────────────────────────────────────────────────────────────────────────

import type { Article } from './rss'
import { classifyArticle, geoClassify } from './classify'

// Struttura della risposta GDELT v2 Doc API (mode=ArtList)
interface GdeltApiArticle {
  url: string
  title?: string
  seendate?: string       // formato compatto: '20240515T120000Z'
  domain?: string
  language?: string
  sourcecountry?: string
}

interface GdeltApiResponse {
  articles?: GdeltApiArticle[]
}

// Query tematiche di default per la copertura redazionale di Lens Veritas
export const DEFAULT_GDELT_QUERIES = [
  'world geopolitics',
  'climate energy',
  'economy markets',
  'armed conflict',
  'technology AI',
  'health pandemic',
  'elections democracy',
  'Italy Europa',
]

// Converte il formato data GDELT ('20240515T120000Z') in ISO 8601
function gdeltDateToISO(seendate: string): string {
  const m = seendate.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/)
  if (!m) return new Date().toISOString()
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`
}

// Rimuove tag HTML ed entità HTML dalle stringhe
function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim()
}

// Esegue una singola query GDELT con timeout di 5 secondi.
// Ritorna array vuoto in caso di errore (fail-safe).
async function fetchSingleQuery(query: string): Promise<GdeltApiArticle[]> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)

  try {
    const url = new URL('https://api.gdeltproject.org/api/v2/doc/doc')
    url.searchParams.set('query', query)
    url.searchParams.set('mode', 'ArtList')
    url.searchParams.set('maxrecords', '25')
    url.searchParams.set('format', 'json')
    url.searchParams.set('sort', 'DateDesc')

    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { 'User-Agent': 'NewsLensVeritas/1.0' },
      next: { revalidate: 300 },
    })
    clearTimeout(timer)

    if (!res.ok) {
      console.warn(`[GDELT] HTTP ${res.status} per query "${query}"`)
      return []
    }

    const data = (await res.json()) as GdeltApiResponse
    return data.articles ?? []
  } catch (err) {
    clearTimeout(timer)
    console.warn(`[GDELT] Query "${query}" fallita: ${(err as Error).message}`)
    return []
  }
}

// Funzione principale esportata.
// Recupera articoli GDELT per multiple query, normalizza nello schema Article
// di Lens Veritas, deduplica per URL. Ogni query fallita viene loggata e
// saltata senza bloccare le altre.
export async function fetchGdeltArticles(
  queries: string[] = DEFAULT_GDELT_QUERIES
): Promise<Article[]> {
  const results = await Promise.allSettled(queries.map(fetchSingleQuery))

  const seenUrls = new Set<string>()
  const articles: Article[] = []

  for (const result of results) {
    if (result.status !== 'fulfilled') continue

    for (const raw of result.value) {
      if (!raw.url || !raw.title) continue
      // Deduplica per URL (lookup O(1))
      if (seenUrls.has(raw.url)) continue
      seenUrls.add(raw.url)

      const title = stripHtml(raw.title)
      // GDELT in mode=ArtList non fornisce il sommario; lasciamo vuoto
      const summary = ''

      articles.push({
        title,
        link: raw.url,
        pubDate: gdeltDateToISO(raw.seendate ?? ''),
        source: raw.domain ?? 'GDELT',
        summary,
        category: classifyArticle(title, summary).category,
        geo: geoClassify(title, summary),
        // GDELT non espone bias/affidabilità per fonte: applichiamo i default
        sourceBias: 'unknown',
        sourceReliability: 7.0,
        sourceType: 'mainstream',
      })
    }
  }

  return articles
}
