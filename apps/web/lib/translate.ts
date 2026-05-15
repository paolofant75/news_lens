import { cacheGet, cacheSet, cacheMGet } from './redis'
import crypto from 'crypto'

export const SUPPORTED_LANGS = [
  { code: 'it', label: 'Italiano',   flag: '🇮🇹' },
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'zh', label: '中文',        flag: '🇨🇳' },
  { code: 'hi', label: 'हिन्दी',       flag: '🇮🇳' },
  { code: 'ar', label: 'العربية',    flag: '🇸🇦' },
]

export const LANG_NAMES: Record<string, string> = {
  it: 'Italian',
  en: 'English',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  zh: 'Simplified Chinese',
  hi: 'Hindi',
  ar: 'Arabic',
}

function hash(text: string): string {
  return crypto.createHash('md5').update(text).digest('hex').slice(0, 12)
}

// Estrae numero e contenuto da ogni riga: tollerante a spazi/markdown/righe vuote
async function claudeTranslate(texts: string[], targetLang: string): Promise<Map<number, string>> {
  const langName = LANG_NAMES[targetLang] ?? targetLang
  const numbered = texts.map((t, i) => `[${i + 1}] ${t}`).join('\n')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 6000,
      messages: [{
        role: 'user',
        content: `Translate the following ${texts.length} numbered items into ${langName}. Each input has format [N] text. You MUST return exactly ${texts.length} lines, each starting with [N] matching the input numbering. Preserve proper nouns. Output ONLY the translations, no commentary.\n\n${numbered}`,
      }],
    }),
  })
  if (!res.ok) throw new Error(`translate http ${res.status}`)
  const data = await res.json()
  const raw = data.content?.[0]?.text ?? ''
  const map = new Map<number, string>()
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*\[(\d+)\]\s*(.+?)\s*$/)
    if (m) {
      const idx = Number(m[1])
      if (Number.isFinite(idx) && idx >= 1 && idx <= texts.length) {
        map.set(idx - 1, m[2])
      }
    }
  }
  return map
}

// Detecta se la fonte è già nella lingua target -> skip traduzione
const SOURCE_NATIVE_LANG: Record<string, string[]> = {
  it: ['ansa', 'corriere', 'repubblica', 'sole 24', 'la stampa', 'fatto quotidiano', 'huffpost it', 'sky tg24', 'adnkronos', 'messaggero', 'open online', 'rai'],
  en: ['bbc', 'reuters', 'ap news', 'guardian', 'nyt', 'new york times', 'cnn', 'washington post', 'bloomberg', 'al jazeera english', 'scmp', 'wired', 'techcrunch', 'mit', 'arstechnica', 'hacker news', 'bleeping', 'bellingcat', 'snopes', 'politifact'],
  fr: ['france 24', 'le monde', 'le figaro', 'le parisien'],
  de: ['dw', 'spiegel', 'zeit', 'faz'],
  es: ['el país', 'el mundo'],
}
function isSourceInLang(source: string | undefined, lang: string): boolean {
  if (!source) return false
  const list = SOURCE_NATIVE_LANG[lang]
  if (!list) return false
  const s = source.toLowerCase()
  return list.some((kw) => s.includes(kw))
}

export async function translateStatsBatch(
  items: { label: string; curiosity: string }[],
  lang: string
): Promise<{ label: string; curiosity: string }[]> {
  if (lang === 'it') return items

  const cacheKeys = items.map(i => `ts2:${lang}:${hash(i.label)}`)

  let cached: (string | null)[] = []
  try { cached = await cacheMGet(cacheKeys) }
  catch { cached = new Array(items.length).fill(null) }

  const result = [...items]
  const toTranslate: { idx: number; label: string; curiosity: string }[] = []

  cached.forEach((val, i) => {
    if (val) {
      try { result[i] = JSON.parse(val) }
      catch { toTranslate.push({ idx: i, ...items[i] }) }
    } else {
      toTranslate.push({ idx: i, ...items[i] })
    }
  })

  if (toTranslate.length > 0) {
    const texts = toTranslate.flatMap(x => [x.label, x.curiosity])
    try {
      const map = await claudeTranslate(texts, lang)
      for (let i = 0; i < toTranslate.length; i++) {
        const l = map.get(i * 2)
        const c = map.get(i * 2 + 1)
        if (l && c) {
          const item = { label: l, curiosity: c }
          result[toTranslate[i].idx] = item
          cacheSet(cacheKeys[toTranslate[i].idx], JSON.stringify(item), 604800).catch(() => {})
        }
      }
    } catch { /* fallback: keep Italian */ }
  }

  return result
}

export async function translateBatch(
  items: { title: string; summary: string; source?: string }[],
  lang: string
): Promise<{ title: string; summary: string }[]> {
  if (lang === 'en' || !lang) return items

  // Cache key v2 -> invalida la cache pre-fix che conteneva fallback inglesi
  const cacheKeys = items.map((item) => `t2:${lang}:${hash(item.title + item.summary)}`)

  let cached: (string | null)[] = []
  try {
    cached = await cacheMGet(cacheKeys)
  } catch {
    cached = new Array(items.length).fill(null)
  }

  const result: { title: string; summary: string }[] = items.map((i) => ({ title: i.title, summary: i.summary }))
  const toTranslate: { idx: number; title: string; summary: string }[] = []

  cached.forEach((val, i) => {
    if (val) {
      try { result[i] = JSON.parse(val) } catch { toTranslate.push({ idx: i, title: items[i].title, summary: items[i].summary }) }
      return
    }
    // Skip articoli che sono GIA' nella lingua target (cache identita')
    if (isSourceInLang(items[i].source, lang)) {
      const same = { title: items[i].title, summary: items[i].summary }
      result[i] = same
      cacheSet(cacheKeys[i], JSON.stringify(same), 604800).catch(() => {})
      return
    }
    toTranslate.push({ idx: i, title: items[i].title, summary: items[i].summary })
  })

  if (toTranslate.length > 0) {
    // Chunks piu' piccoli (10 -> max 20 texts/call) per ridurre rischio truncation
    const CHUNK = 10
    for (let start = 0; start < toTranslate.length; start += CHUNK) {
      const chunk = toTranslate.slice(start, start + CHUNK)
      const texts = chunk.flatMap((x) => [x.title, x.summary])
      try {
        const map = await claudeTranslate(texts, lang)
        for (let i = 0; i < chunk.length; i++) {
          const t = map.get(i * 2)
          const s = map.get(i * 2 + 1)
          if (t && s) {
            // SOLO se ENTRAMBI tradotti -> aggiorna result e cache
            const translatedItem = { title: t, summary: s }
            result[chunk[i].idx] = translatedItem
            cacheSet(cacheKeys[chunk[i].idx], JSON.stringify(translatedItem), 604800).catch(() => {})
          } else {
            // Traduzione incompleta per questo item -> NON cachare, lascia originale
            console.warn(`[translate] item ${chunk[i].idx} parzialmente tradotto (t=${!!t}, s=${!!s}) lang=${lang}`)
          }
        }
      } catch (e) {
        console.warn(`[translate] batch failed lang=${lang}:`, (e as Error).message)
        // NON cachare nulla del batch
      }
    }
  }

  return result
}
