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
    id: 'breaking', label: '🚨 Breaking News', level: 1, type: 'static',
    keywords: ['breaking', 'urgent', 'alert', 'just in', 'crisis', 'emergency', 'disaster', 'breaking news'],
  },
  {
    id: 'geopolitics', label: '🌍 Geopolitica', level: 1, type: 'static',
    keywords: ['geopolitics', 'diplomatic', 'conflict', 'war', 'military', 'troops', 'usa', 'russia', 'china', 'europe', 'middle east', 'israel', 'gaza', 'nato', 'united nations'],
  },
  {
    id: 'ai_tech', label: '💡 AI & Tecnologia', level: 1, type: 'static',
    keywords: ['artificial intelligence', 'technology', 'tech', 'software', 'digital', 'ai', 'llm', 'openai', 'claude', 'gemini', 'hack', 'cybersecurity', 'apple', 'google', 'meta', 'microsoft', 'amazon', 'nvidia', 'startup', 'innovation'],
  },
  {
    id: 'economy_finance', label: '💰 Economia & Finanza', level: 1, type: 'static',
    keywords: ['economy', 'trade', 'gdp', 'business', 'market', 'commerce', 'commercial', 'finance', 'financial', 'stock', 'banking', 'bank', 'crypto', 'bitcoin', 'ethereum', 'investment', 'inflation', 'recession', 'euro', 'dollaro'],
  },
  {
    id: 'health_science', label: '🏥 Salute & Scienza', level: 1, type: 'static',
    keywords: ['health', 'science', 'research', 'medical', 'disease', 'epidemic', 'pandemic', 'vaccine', 'climate', 'physics', 'astronomy', 'environment', 'sustainability', 'medicine'],
  },
  {
    id: 'sport', label: '⚽ Sport', level: 1, type: 'static',
    keywords: ['sport', 'football', 'soccer', 'tennis', 'basket', 'olympics', 'champions', 'serie a', 'premier league', 'la liga', 'nba', 'motogp', 'f1', 'calcio', 'juventus', 'milan'],
  },
  {
    id: 'culture', label: '🎬 Cultura & Società', level: 1, type: 'static',
    keywords: ['culture', 'art', 'music', 'cinema', 'film', 'television', 'entertainment', 'society', 'social', 'trends', 'celebrities', 'fashion', 'design', 'theater', 'literature', 'museo', 'arte'],
  },
  {
    id: 'local_news', label: '📍 Cronaca Locale', level: 1, type: 'static',
    keywords: ['local', 'regional', 'city', 'region', 'province', 'territorio', 'comunale', 'regione', 'cronaca', 'news locali'],
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
