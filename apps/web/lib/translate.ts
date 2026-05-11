import { cacheGet, cacheSet } from './redis'
import crypto from 'crypto'

export const SUPPORTED_LANGS = [
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
]

function hash(text: string): string {
  return crypto.createHash('md5').update(text).digest('hex').slice(0, 12)
}

async function claudeTranslate(texts: string[], targetLang: string): Promise<string[]> {
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
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Translate the following numbered texts to ${targetLang}. Keep the numbering. Return ONLY the translated texts in the same format, nothing else.\n\n${numbered}`,
      }],
    }),
  })
  const data = await res.json()
  const raw = data.content?.[0]?.text ?? ''
  const lines = raw.split('\n').filter((l: string) => /^\[\d+\]/.test(l.trim()))
  return lines.map((l: string) => l.replace(/^\[\d+\]\s*/, '').trim())
}

export async function translateBatch(
  items: { title: string; summary: string }[],
  lang: string
): Promise<{ title: string; summary: string }[]> {
  if (lang === 'en') return items

  const cacheKeys = items.map((item) => `t:${lang}:${hash(item.title + item.summary)}`)
  let cached: (string | null)[] = []

  try {
    const { cacheMGet } = await import('./redis')
    cached = await cacheMGet(cacheKeys)
  } catch {
    cached = new Array(items.length).fill(null)
  }

  const result = [...items]
  const toTranslate: { idx: number; title: string; summary: string }[] = []

  cached.forEach((val, i) => {
    if (val) {
      const parsed = JSON.parse(val)
      result[i] = parsed
    } else {
      toTranslate.push({ idx: i, ...items[i] })
    }
  })

  if (toTranslate.length > 0) {
    const texts = toTranslate.flatMap((x) => [x.title, x.summary])
    try {
      const translated = await claudeTranslate(texts, lang)
      for (let i = 0; i < toTranslate.length; i++) {
        const translatedItem = {
          title: translated[i * 2] ?? toTranslate[i].title,
          summary: translated[i * 2 + 1] ?? toTranslate[i].summary,
        }
        result[toTranslate[i].idx] = translatedItem
        await cacheSet(cacheKeys[toTranslate[i].idx], JSON.stringify(translatedItem))
      }
    } catch {
      // fallback: keep originals
    }
  }

  return result
}
