import { LANG_NAMES } from './translate'

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
  tipo_bias: 'neutro' | 'politico' | 'sensazionalistico' | 'omissivo' | 'parziale' | 'non pertinente'
  nota: string
}

export type FiveWs = {
  who: string
  what: string
  where: string
  when: string
  why: string
}

export type VeritasResult = {
  query: string
  articolo_consolidato: string
  five_ws: FiveWs
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

export function cleanSearchQuery(title: string): string {
  if (title.startsWith('http')) return extractQueryFromUrl(title)
  let q = title
  // Remove trailing noise after – or | (e.g. "– latest news", "| BBC")
  q = q.replace(/\s*[–—|]\s*(latest|breaking|live|watch|in full|analysis|explainer|fact.?check|bbc|cnn|guardian|npr|reuters).*$/i, '')
  // Remove noise phrases wherever they appear
  q = q.replace(/\b(live updates?|live blog|latest news|latest updates?|breaking news|as it happened|in full|developing story|watch live)\b/gi, '')
  // Remove punctuation separators
  q = q.replace(/[–—:|]/g, ' ')
  // Collapse whitespace
  q = q.trim().replace(/\s+/g, ' ')
  // Keep first 8 meaningful words
  const words = q.split(' ').filter((w) => w.length > 1)
  return words.slice(0, 8).join(' ')
}

async function expandQuery(query: string): Promise<string[]> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 120,
        messages: [{
          role: 'user',
          content: `You are a news search expert. Given a query (any language), return a JSON array of exactly 3 English search terms suitable for news APIs, ordered from most specific to most general. Return ONLY valid JSON, no other text.\n\nQuery: "${query}"\n\nExample: "prezzo petrolio" → ["oil price crude", "OPEC production cut", "energy market"]`,
        }],
      }),
    })
    const data = await res.json()
    const text = (data.content?.[0]?.text ?? '').replace(/```json?\n?|\n?```/g, '').trim()
    const arr = JSON.parse(text)
    if (Array.isArray(arr) && arr.length > 0) {
      return arr.slice(0, 3).filter((x: unknown) => typeof x === 'string' && x.length > 0)
    }
  } catch { /* fall through */ }
  return [query]
}

export async function searchAllSources(query: string): Promise<SearchArticle[]> {
  // Espandi la query in inglese con termini correlati
  const terms = await expandQuery(query)

  // Cerca con tutti i termini in parallelo su tutte le API
  const searches = await Promise.allSettled(
    terms.flatMap((term) => [
      searchNewsAPI(term),
      searchGuardian(term),
      searchGNews(term),
    ])
  )
  const all = searches
    .filter((r): r is PromiseFulfilledResult<SearchArticle[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)

  // Deduplica per URL (stessa notizia da API diverse)
  const byUrl = new Map<string, SearchArticle>()
  for (const x of all) {
    if (!byUrl.has(x.link)) byUrl.set(x.link, x)
  }

  // Deduplica per source (una per testata)
  const bySource = new Map<string, SearchArticle>()
  for (const x of byUrl.values()) {
    const key = x.source.toLowerCase().trim()
    if (!bySource.has(key)) bySource.set(key, x)
  }

  return Array.from(bySource.values()).slice(0, 14)
}

export async function analyzeWithVeritas(query: string, articles: SearchArticle[], lang = 'it'): Promise<VeritasResult> {
  const articlesText = articles
    .map((a, i) => `[${i + 1}] FONTE: ${a.source}\nTITOLO: ${a.title}\nCONTENUTO: ${a.content}`)
    .join('\n\n---\n\n')

  const prompt = `Sei un giornalista professionista senior con 20 anni di esperienza internazionale. Il tuo compito è produrre un articolo giornalistico completo e imparziale basandoti sulle fonti fornite.

ARGOMENTO: "${query}"

FONTI DISPONIBILI:
${articlesText}

ISTRUZIONI TASSATIVE:
1. L'articolo consolidato deve essere scritto come un pezzo giornalistico professionale in ${LANG_NAMES[lang] ?? lang}: fatti verificati, dati precisi, citazioni dirette quando disponibili, contesto storico se necessario. 4-5 paragrafi densi e informativi.
2. NON commentare le fonti nell'articolo. NON scrivere frasi come "va segnalato che alcune fonti...", "alcune fonti risultano fuori contesto...", "la copertura è limitata a...". L'articolo parla SOLO dei fatti della notizia.
3. Per l'analisi delle fonti: valuta esclusivamente le fonti che trattano direttamente l'argomento. Per quelle non pertinenti assegna completezza=0, bias=0, tipo_bias="non pertinente".

Rispondi SOLO con JSON valido, senza testo aggiuntivo:

{
  "articolo_consolidato": "testo articolo professionale",
  "five_ws": {
    "who": "2-3 frasi: nomi completi, ruoli istituzionali, affiliazioni politiche/organizzative dei soggetti principali e delle parti coinvolte",
    "what": "2-3 frasi: descrizione precisa degli eventi, cifre e dati numerici se disponibili, sviluppi cronologici principali",
    "where": "1-2 frasi: luoghi specifici con contesto geografico e geopolitico rilevante",
    "when": "1-2 frasi: date precise, sequenza temporale degli eventi, durata se pertinente",
    "why": "2-3 frasi: cause profonde, motivazioni dichiarate e reali, contesto storico-politico e possibili implicazioni future"
  },
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
        max_tokens: 3500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await res.json()
    const text = data.content?.[0]?.text ?? '{}'
    const json = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())
    return {
      query,
      articolo_consolidato: json.articolo_consolidato,
      five_ws: json.five_ws ?? { who: '', what: '', where: '', when: '', why: '' },
      sources: articles,
      analisi: json.analisi ?? [],
    }
  } catch {
    return {
      query,
      articolo_consolidato: 'Analisi non disponibile al momento.',
      five_ws: { who: '', what: '', where: '', when: '', why: '' },
      sources: articles,
      analisi: [],
    }
  }
}
