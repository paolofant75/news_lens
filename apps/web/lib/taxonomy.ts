export type TaxNode = {
  id: string
  label: string
  level: number
  keywords: string[]
  children?: TaxNode[]
  type?: 'static' | 'dynamic' | 'ai' | 'advanced'
}

export const TAXONOMY: TaxNode[] = [
  {
    id: 'breaking', label: 'Breaking News', level: 1, type: 'static',
    keywords: ['breaking', 'urgent', 'alert', 'just in', 'crisis', 'emergency', 'disaster'],
  },
  {
    id: 'geopolitics', label: 'Geopolitica', level: 1, type: 'static',
    keywords: ['geopolitics', 'diplomatic', 'conflict', 'war', 'military', 'troops', 'usa', 'russia', 'china', 'europe', 'middle east', 'israel', 'gaza'],
  },
  {
    id: 'ai_tech', label: 'AI Tech', level: 1, type: 'static',
    keywords: ['artificial intelligence', 'technology', 'tech', 'software', 'digital', 'ai', 'llm', 'openai', 'claude', 'gemini', 'hack', 'cybersecurity', 'apple', 'google', 'meta', 'microsoft', 'amazon', 'nvidia'],
  },
  {
    id: 'economy', label: 'Economia', level: 1, type: 'static',
    keywords: ['economy', 'trade', 'gdp', 'business', 'market', 'commerce', 'commercial'],
  },
  {
    id: 'finance', label: 'Finanza', level: 1, type: 'static',
    keywords: ['finance', 'financial', 'market', 'stock', 'banking', 'bank', 'crypto', 'bitcoin', 'ethereum', 'investment', 'inflation'],
  },
  {
    id: 'health_science', label: 'Salute e Scienza', level: 1, type: 'static',
    keywords: ['health', 'science', 'research', 'medical', 'disease', 'epidemic', 'pandemic', 'vaccine', 'climate', 'physics', 'astronomy'],
  },
  {
    id: 'sport', label: 'Sport', level: 1, type: 'static',
    keywords: ['sport', 'football', 'soccer', 'tennis', 'basket', 'olympics', 'champions', 'serie a', 'premier league', 'la liga', 'nba', 'motogp', 'f1'],
  },
]

export function getAllKeywords(node: TaxNode): string[] {
  const kws = [...node.keywords]
  if (node.children) {
    for (const child of node.children) {
      kws.push(...getAllKeywords(child))
    }
  }
  return [...new Set(kws)]
}

export function buildCounts(
  articles: { title: string; summary: string; source: string }[]
): Record<string, number> {
  const counts: Record<string, number> = {}
  function traverse(nodes: TaxNode[]) {
    for (const n of nodes) {
      const allKws = getAllKeywords(n)
      counts[n.id] = allKws.length === 0 ? 0 : articles.filter((a) => {
        const text = (a.title + ' ' + a.summary + ' ' + a.source).toLowerCase()
        return allKws.some((kw) => text.includes(kw.toLowerCase()))
      }).length
      if (n.children) traverse(n.children)
    }
  }
  traverse(TAXONOMY)
  return counts
}
