// ─────────────────────────────────────────────────────────────────────────────
// CategoryClassifierAgent — primo agente del sistema multi-agent Lens Veritas.
//
// Pipeline execute():
//   1) sha256(title|summary) -> Redis cache lookup (TTL 30gg)
//   2) Cache miss -> chiamata Anthropic con system prompt editoriale
//   3) Parse JSON con Zod (errore -> throw, il runtime gestisce retry/backoff)
//   4) Cache write fire-and-forget
//
// L'output e' deterministico per stesso (title, summary), insensibile a
// sourceName/language: questi sono solo hint al modello, non parte della chiave.
// Se questo si rivela un problema (es. modello che varia per language), basta
// includere quei campi nell'hash della cache.
// ─────────────────────────────────────────────────────────────────────────────

import { BaseAgent, anthropic, DEFAULT_MODEL } from '@news-lens-veritas/ai'
import { SYSTEM_PROMPT } from './system-prompt'
import {
  ClassificationInput,
  ClassificationOutput,
  type ClassificationInput as ClassificationInputT,
  type ClassificationOutput as ClassificationOutputT,
} from './schema'
import { getCachedClassification, setCachedClassification } from './cache'

const MAX_OUTPUT_TOKENS = 1024

function buildUserMessage(input: ClassificationInputT): string {
  // Trasmetti l'input come JSON: il modello vede una struttura chiara e non
  // confonde "titolo" con "sommario". Limito summary a 800 char per non
  // sprecare token su contenuti lunghi (il classificatore non ne ha bisogno).
  return JSON.stringify({
    title:      input.title,
    summary:    (input.summary ?? '').slice(0, 800),
    sourceName: input.sourceName,
    language:   input.language,
  })
}

/** Estrae il primo blocco JSON parsable dalla risposta Claude (tollera markdown fences). */
function extractJson(raw: string): string | null {
  const cleaned = raw.replace(/```json\s*|\s*```/g, '').trim()
  const match = cleaned.match(/\{[\s\S]*\}/)
  return match ? match[0] : null
}

export class CategoryClassifierAgent extends BaseAgent<ClassificationInputT, ClassificationOutputT> {
  readonly name = 'category-classifier'
  readonly version = '1.0.0'
  readonly systemPrompt = SYSTEM_PROMPT

  override getSchema() {
    return ClassificationOutput
  }

  async execute(rawInput: ClassificationInputT): Promise<ClassificationOutputT> {
    // 1) Valida input (default su summary/sourceName/language gestiti da Zod)
    const input = ClassificationInput.parse(rawInput)

    // 2) Cache lookup
    const cached = await getCachedClassification(input.title, input.summary)
    if (cached) {
      // Validazione difensiva: se la cache contiene un payload non piu' valido
      // (schema cambiato), trattiamolo come miss
      const valid = ClassificationOutput.safeParse(cached)
      if (valid.success) return valid.data
    }

    // 3) Chiamata Anthropic (Sonnet di default, override via env ANTHROPIC_MODEL)
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: this.systemPrompt,
      messages: [{ role: 'user', content: buildUserMessage(input) }],
    })

    // 4) Estrai testo dalla risposta (Anthropic ritorna content blocks union: text|tool_use|...).
    // Narrowing inline: il SDK ha TextBlock con campi opzionali variabili tra versioni, evitiamo
    // type-predicate fragile e accediamo a .text solo dopo aver verificato il discriminator.
    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Anthropic response missing text block')
    }
    const text = textBlock.text

    const jsonStr = extractJson(text)
    if (!jsonStr) {
      throw new Error(`Anthropic response not parsable as JSON: ${text.slice(0, 200)}`)
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(jsonStr)
    } catch (err) {
      throw new Error(`JSON.parse failed: ${(err as Error).message}`)
    }

    // 5) Valida con Zod (errore -> throw, runtime retry)
    const result = ClassificationOutput.safeParse(parsed)
    if (!result.success) {
      throw new Error(`Zod validation failed: ${result.error.message}`)
    }

    // 6) Cache write fire-and-forget
    setCachedClassification(input.title, input.summary, result.data).catch(() => undefined)

    return result.data
  }
}

/** Istanza singleton riusabile (nessuno stato interno mutabile). */
export const categoryClassifier = new CategoryClassifierAgent()
