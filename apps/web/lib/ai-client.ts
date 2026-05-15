// Provider unificato: usa DeepSeek se DEEPSEEK_API_KEY e' presente, altrimenti
// fallback su Anthropic. Stessa interfaccia per tutte le chiamate AI del sito
// (traduzioni Haiku, query expansion, analisi Veritas).
//
// DeepSeek (~3x meno costoso di Haiku, ~13x meno di Sonnet) e' OpenAI-compatible:
//   endpoint: https://api.deepseek.com/v1/chat/completions
//   modelli: deepseek-chat (V3, generico), deepseek-reasoner (R1, ragionamento)

export type AIMessage = { role: 'user' | 'system' | 'assistant'; content: string }

export type AITier = 'fast' | 'smart'

type ProviderConfig = {
  name: 'deepseek' | 'anthropic'
  models: Record<AITier, string>
}

function getProvider(): ProviderConfig {
  if (process.env.DEEPSEEK_API_KEY) {
    return {
      name: 'deepseek',
      models: {
        fast: 'deepseek-chat',     // V3 - traduzioni, query expansion
        smart: 'deepseek-chat',    // V3 - analisi Veritas (sufficiente in testing)
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

export async function aiComplete(opts: {
  messages: AIMessage[]
  maxTokens?: number
  tier?: AITier
}): Promise<string> {
  const provider = getProvider()
  const model = provider.models[opts.tier ?? 'fast']
  const maxTokens = opts.maxTokens ?? 1000

  if (provider.name === 'deepseek') {
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
    if (!res.ok) throw new Error(`deepseek http ${res.status}`)
    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? ''
  }

  // Anthropic
  // Converte messaggi: 'system' diventa system prompt separato, gli altri restano
  const system = opts.messages.find((m) => m.role === 'system')?.content
  const conv = opts.messages.filter((m) => m.role !== 'system')
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
  if (!res.ok) throw new Error(`anthropic http ${res.status}`)
  const data = await res.json()
  return data.content?.[0]?.text ?? ''
}

export function aiProviderName(): 'deepseek' | 'anthropic' {
  return getProvider().name
}
