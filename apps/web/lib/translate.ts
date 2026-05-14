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

async function claudeTranslate(texts: string[], targetLang: string): Promise<string[]> {
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
        content: `Translate the following numbered news headlines and summaries to ${langName}. Preserve proper nouns (names, places). Keep the [N] numbering. Return ONLY the translated texts, nothing else.\n\n${numbered}`,
      }],
    }),
  })
  const data = await res.json()
  const raw = data.content?.[0]?.text ?? ''
  const lines = raw.split('\n').filter((l: string) => /^\[\d+\]/.test(l.trim()))
  return lines.map((l: string) => l.replace(/^\[\d+\]\s*/, '').trim())
}

export async function translateStatsBatch(
  items: { label: string; curiosity: string }[],
  lang: string
): Promise<{ label: string; curiosity: string }[]> {
  if (lang === 'it') return items

  const cacheKeys = items.map(i => `ts:${lang}:${hash(i.label)}`)

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
      const translated = await claudeTranslate(texts, lang)
      for (let i = 0; i < toTranslate.length; i++) {
        const item = {
          label:    translated[i * 2]     ?? toTranslate[i].label,
          curiosity: translated[i * 2 + 1] ?? toTranslate[i].curiosity,
        }
        result[toTranslate[i].idx] = item
        cacheSet(cacheKeys[toTranslate[i].idx], JSON.stringify(item)).catch(() => {})
      }
    } catch { /* fallback: keep Italian */ }
  }

  return result
}

export async function translateBatch(
  items: { title: string; summary: string }[],
  lang: string
): Promise<{ title: string; summary: string }[]> {
  if (lang === 'en' || !lang) return items

  const cacheKeys = items.map((item) => `t:${lang}:${hash(item.title + item.summary)}`)

  let cached: (string | null)[] = []
  try {
    cached = await cacheMGet(cacheKeys)
  } catch {
    cached = new Array(items.length).fill(null)
  }

  const result = [...items]
  const toTranslate: { idx: number; title: string; summary: string }[] = []

  cached.forEach((val, i) => {
    if (val) {
      try { result[i] = JSON.parse(val) } catch { toTranslate.push({ idx: i, ...items[i] }) }
    } else {
      toTranslate.push({ idx: i, ...items[i] })
    }
  })

  if (toTranslate.length > 0) {
    // Traduci in batch da 20 per evitare token overflow
    const CHUNK = 20
    for (let start = 0; start < toTranslate.length; start += CHUNK) {
      const chunk = toTranslate.slice(start, start + CHUNK)
      const texts = chunk.flatMap((x) => [x.title, x.summary])
      try {
        const translated = await claudeTranslate(texts, lang)
        for (let i = 0; i < chunk.length; i++) {
          const translatedItem = {
            title: translated[i * 2] ?? chunk[i].title,
            summary: translated[i * 2 + 1] ?? chunk[i].summary,
          }
          result[chunk[i].idx] = translatedItem
          cacheSet(cacheKeys[chunk[i].idx], JSON.stringify(translatedItem)).catch(() => {})
        }
      } catch {
        // fallback: tieni originali
      }
    }
  }

  return result
}
