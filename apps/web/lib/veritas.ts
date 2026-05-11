import { relevanceScore } from './classify'

export type SearchArticle = {
  title: string
  link: string
  pubDate: string
  source: string
  content: string
}

export type SourceAnalysis = {
  fonte: string
  indice: number
  completezza: number
  bias: number
  tipo_bias: 'neutro' | 'politico' | 'sensazionalistico' | 'omissivo' | 'parziale'
  nota: string
}

export type VeritasResult = {
  query: string
  articolo_consolidato: string
  sources: SearchArticle[]
  analisi: SourceAnalysis[]
}

async function searchNewsAPI(query: string): Promise<SearchArticle[]> {
  try {
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=8&language=en&sortBy=relevancy&apiKey=${process.env.NEWS_API_KEY}`
    )
    const data = await res.json()
    if (data.status !== 'ok') return []
    return data.articles
      .filter((a: { title?: string; url?: string }) => a.title && a.url && a.title !== '[Removed]')
      .map((a: { title: string; url: string; publishedAt: string; source: { name: string }; description?: string }) => ({
        title: a.title,
        link: a.url,
        pubDate: a.publishedAt,
        source: a.source.name,
        content: `${a.title}. ${a.description ?? ''}`,
      }))
  } catch { return [] }
}

async function searchGuardian(query: string): Promise<SearchArticle[]> {
  try {
    const res = await fetch(
      `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&api-key=${process.env.GUARDIAN_API_KEY}&page-size=8&show-fields=trailText&order-by=relevance`
    )
    const data = await res.json()
    if (data.response?.status !== 'ok') return []
    return data.response.results.map((a: { webTitle: string; webUrl: string; webPublicationDate: string; fields?: { trailText?: string } }) => ({
      title: a.webTitle,
      link: a.webUrl,
      pubDate: a.webPublicationDate,
      source: 'The Guardian',
      content: `${a.webTitle}. ${a.fields?.trailText ?? ''}`,
    }))
  } catch { return [] }
}

async function searchGNews(query: string): Promise<SearchArticle[]> {
  try {
    const res = await fetch(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&token=${process.env.GNEWS_API_KEY}&max=8&lang=en`
    )
    const data = await res.json()
    if (!data.articles) return []
    return data.articles.map((a: { title: string; url: string; publishedAt: string; source: { name: string }; description?: string }) => ({
      title: a.title,
      link: a.url,
      pubDate: a.publishedAt,
      source: a.source.name,
      content: `${a.title}. ${a.description ?? ''}`,
    }))
  } catch { return [] }
}

export function extractQueryFromUrl(input: string): string {
  try {
    const url = new URL(input)
    const segments = url.pathname.split('/').filter(Boolean)
    const last = segments[segments.length - 1] ?? ''
    return last.replace(/[-_]/g, ' ').replace(/\d+/g, '').trim() || segments.join(' ')
  } catch {
    return input
  }
}

export async function searchAllSources(query: string): Promise<SearchArticle[]> {
  const [a, b, c] = await Promise.allSettled([
    searchNewsAPI(query),
    searchGuardian(query),
    searchGNews(query),
  ])
  const all = [
    ...(a.status === 'fulfilled' ? a.value : []),
    ...(b.status === 'fulfilled' ? b.value : []),
    ...(c.status === 'fulfilled' ? c.value : []),
  ]

  // Filtro rilevanza: rimuove articoli non pertinenti alla query (es. "Europa League" per query "europa")
  const filtered = all.filter((x) => {
    const score = relevanceScore(x.title + ' ' + x.content, query)
    return score >= 0.3
  })

  // Deduplica per source (una sola notizia per testata, la più rilevante)
  const bySource = new Map<string, SearchArticle>()
  for (const x of filtered) {
    const sourceKey = x.source.toLowerCase().trim()
    if (!bySource.has(sourceKey)) {
      bySource.set(sourceKey, x)
    } else {
      // Tieni quella con score rilevanza più alta
      const existing = bySource.get(sourceKey)!
      if (relevanceScore(x.title + ' ' + x.content, query) > relevanceScore(existing.title + ' ' + existing.content, query)) {
        bySource.set(sourceKey, x)
      }
    }
  }

  return Array.from(bySource.values()).slice(0, 12)
}

export async function analyzeWithVeritas(query: string, articles: SearchArticle[]): Promise<VeritasResult> {
  const articlesText = articles
    .map((a, i) => `[${i + 1}] FONTE: ${a.source}\nTITOLO: ${a.title}\nCONTENUTO: ${a.content}`)
    .join('\n\n---\n\n')

  const prompt = `Sei un giornalista professionista senior con 20 anni di esperienza internazionale. Il tuo compito è produrre un articolo giornalistico completo e imparziale basandoti sulle fonti fornite.

ARGOMENTO: "${query}"

FONTI DISPONIBILI:
${articlesText}

ISTRUZIONI TASSATIVE:
1. L'articolo consolidato deve essere scritto come un pezzo giornalistico professionale in italiano: fatti verificati, dati precisi, citazioni dirette quando disponibili, contesto storico se necessario. 4-5 paragrafi densi e informativi.
2. NON commentare le fonti nell'articolo. NON scrivere frasi come "va segnalato che alcune fonti...", "alcune fonti risultano fuori contesto...", "la copertura è limitata a...". L'articolo parla SOLO dei fatti della notizia.
3. Per l'analisi delle fonti: valuta esclusivamente le fonti che trattano direttamente l'argomento. Per quelle non pertinenti assegna completezza=0, bias=0, tipo_bias="non pertinente".

Rispondi SOLO con JSON valido, senza testo aggiuntivo:

{
  "articolo_consolidato": "testo articolo professionale in italiano",
  "analisi": [
    {
      "fonte": "nome fonte esatto",
      "indice": 1,
      "completezza": 80,
      "bias": 15,
      "tipo_bias": "neutro",
      "nota": "una frase breve e oggettiva sulla copertura"
    }
  ]
}`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await res.json()
    const text = data.content?.[0]?.text ?? '{}'
    const json = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())
    return { query, articolo_consolidato: json.articolo_consolidato, sources: articles, analisi: json.analisi ?? [] }
  } catch {
    return { query, articolo_consolidato: 'Analisi non disponibile al momento.', sources: articles, analisi: [] }
  }
}
