// Prezzi per milione di token (USD). Aggiornare quando i provider cambiano.
export const PRICING_PER_M: Record<string, { input: number; output: number }> = {
  // DeepSeek
  'deepseek-chat': { input: 0.27, output: 1.10 },
  'deepseek-reasoner': { input: 0.55, output: 2.19 },
  // Anthropic Claude
  'claude-haiku-4-5-20251001': { input: 0.80, output: 4.00 },
  'claude-sonnet-4-6': { input: 3.00, output: 15.00 },
  'claude-opus-4-6': { input: 15.00, output: 75.00 },
  'claude-opus-4-7': { input: 15.00, output: 75.00 },
}

export function tokenCost(model: string, inputTokens: number, outputTokens: number): number {
  const p = PRICING_PER_M[model]
  if (!p) return 0
  return (inputTokens * p.input + outputTokens * p.output) / 1_000_000
}
