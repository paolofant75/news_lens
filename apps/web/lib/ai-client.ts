// Provider unificato: usa DeepSeek se DEEPSEEK_API_KEY e' presente, altrimenti
// fallback su Anthropic. Stessa interfaccia per tutte le chiamate AI del sito
// (traduzioni Haiku, query expansion, analisi Veritas).
//
// DeepSeek (~3x meno costoso di Haiku, ~13x meno di Sonnet) e' OpenAI-compatible:
//   endpoint: https://api.deepseek.com/v1/chat/completions
//   modelli: deepseek-chat (V3, generico), deepseek-reasoner (R1, ragionamento)
//
// Ogni chiamata logga token+latenza su Supabase (ai_usage_log) per dashboard
// consumi. Il logging e' fire-and-forget: non blocca il return.

import { createClient } from '@supabase/supabase-js'

export type AIMessage = { role: 'user' | 'system' | 'assistant'; content: string }
export type AITier = 'fast' | 'smart'
export type AIContext = 'translate' | 'veritas' | 'expand-query' | 'intelligence' | 'other'

type ProviderConfig = {
  name: 'deepseek' | 'anthropic'
  models: Record<AITier, string>
}

function getProvider(): ProviderConfig {
  if (process.env.DEEPSEEK_API_KEY) {
    return {
      name: 'deepseek',
      models: {
        fast: 'deepseek-chat',       // V3 - traduzioni, query expansion (veloce, economico)
        smart: 'deepseek-reasoner',  // R1 - analisi Veritas (segue meglio prompt strutturati)
      },
    }
  }
  return {
    name: 'anthropic',
    models: {
      fast: 'claude-haiku-4-5-20251001',
      smart: 'claude-sonnet-4-6',
    },
  }
}

let _supabase: ReturnType<typeof createClient> | null = null
function logClient() {
  if (_supabase) return _supabase
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null
  _supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
  return _supabase
}

function logUsage(entry: {
  provider: 'deepseek' | 'anthropic'
  model: string
  tier: AITier
  context: AIContext
  inputTokens: number
  outputTokens: number
  latencyMs: number
  success: boolean
  errorMessage?: string
}): void {
  const sb = logClient()
  if (!sb) return
  const payload = {
    provider: entry.provider,
    model: entry.model,
    tier: entry.tier,
    context: entry.context,
    input_tokens: entry.inputTokens,
    output_tokens: entry.outputTokens,
    latency_ms: entry.latencyMs,
    success: entry.success,
    error_message: entry.errorMessage ?? null,
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(sb.from('ai_usage_log') as any).insert(payload).then(({ error }: { error: { message: string } | null }) => {
    if (error) console.warn('[ai-usage-log]', error.message)
  })
}

export async function aiComplete(opts: {
  messages: AIMessage[]
  maxTokens?: number
  tier?: AITier
  context?: AIContext
}): Promise<string> {
  const provider = getProvider()
  const tier = opts.tier ?? 'fast'
  const model = provider.models[tier]
  const maxTokens = opts.maxTokens ?? 1000
  const context = opts.context ?? 'other'
  const start = Date.now()

  if (provider.name === 'deepseek') {
    try {
      const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: opts.messages,
          max_tokens: maxTokens,
          temperature: 0.3,
        }),
      })
      const data = await res.json()
      const latencyMs = Date.now() - start
      if (!res.ok) {
        logUsage({ provider: 'deepseek', model, tier, context, inputTokens: 0, outputTokens: 0, latencyMs, success: false, errorMessage: data?.error?.message ?? `http ${res.status}` })
        throw new Error(`deepseek http ${res.status}`)
      }
      logUsage({
        provider: 'deepseek', model, tier, context,
        inputTokens: data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
        latencyMs, success: true,
      })
      return data.choices?.[0]?.message?.content ?? ''
    } catch (e) {
      const latencyMs = Date.now() - start
      logUsage({ provider: 'deepseek', model, tier, context, inputTokens: 0, outputTokens: 0, latencyMs, success: false, errorMessage: (e as Error).message })
      throw e
    }
  }

  // Anthropic
  const system = opts.messages.find((m) => m.role === 'system')?.content
  const conv = opts.messages.filter((m) => m.role !== 'system')
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system,
        messages: conv,
      }),
    })
    const data = await res.json()
    const latencyMs = Date.now() - start
    if (!res.ok) {
      logUsage({ provider: 'anthropic', model, tier, context, inputTokens: 0, outputTokens: 0, latencyMs, success: false, errorMessage: data?.error?.message ?? `http ${res.status}` })
      throw new Error(`anthropic http ${res.status}`)
    }
    logUsage({
      provider: 'anthropic', model, tier, context,
      inputTokens: data.usage?.input_tokens ?? 0,
      outputTokens: data.usage?.output_tokens ?? 0,
      latencyMs, success: true,
    })
    return data.content?.[0]?.text ?? ''
  } catch (e) {
    const latencyMs = Date.now() - start
    logUsage({ provider: 'anthropic', model, tier, context, inputTokens: 0, outputTokens: 0, latencyMs, success: false, errorMessage: (e as Error).message })
    throw e
  }
}

export function aiProviderName(): 'deepseek' | 'anthropic' {
  return getProvider().name
}
