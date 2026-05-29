import type { Article } from './rss'

// Pesi per categoria: determina rilevanza editoriale
// Basato su TAXONOMY (lib/taxonomy.ts)
const CATEGORY_WEIGHT: Record<string, number> = {
  breaking: 1.0,           // Massima priorità
  geopolitics: 0.9,        // Alto impatto globale
  ai_tech: 0.7,            // Impatto futuro
  economy_finance: 0.7,    // Rilevanza economica
  health_science: 0.6,     // Impatto pubblico
  sport: 0.3,              // Entertainment
  culture: 0.4,            // Engagement culturale
  local_news: 0.5,         // Rilevanza territoriale
}

/**
 * Calcola l'importanza di una notizia (0-1) basato su segnali deterministici.
 *
 * Fattori considerati:
 * - Coverage breadth (35%): quante fonti coprono la stessa storia
 * - Source tier (25%): affidabilità geopolitica della fonte (Reuters/BBC > verticali)
 * - Source reliability (20%): scala 5.0-9.5 normalizzata
 * - Category weight (15%): breaking > politica > sport
 * - Recency (5%): decay lineare su 24h
 *
 * Usato in classify-articles cron per ordinare articoli per importanza
 * e selezionare solo i top-N da classificare via AI.
 */
export function calcImportanceScore(article: Article): number {
  // 1. Coverage breadth: log scale (1 source=0, 10 sources=1)
  const coverageCount = article.coverageCount ?? 1
  const coverageNorm = Math.min(1, Math.log2(coverageCount) / Math.log2(10))

  // 2. Source tier: Tier 1 (Reuters/BBC/AP) score high
  const tierMap: Record<number, number> = { 1: 1.0, 2: 0.75, 3: 0.5 }
  const tierScore = tierMap[article.sourceGlobalTier ?? 3] ?? 0.5

  // 3. Source reliability: scale 5.0-9.5 → 0-1
  const reliabilityNorm = Math.max(0, Math.min(1, (article.sourceReliability - 5) / 4.5))

  // 4. Category weight
  const catNorm = CATEGORY_WEIGHT[article.category] ?? 0.2

  // 5. Recency: linear decay over 24h
  const hoursOld = Math.max(0, (Date.now() - new Date(article.pubDate).getTime()) / 3_600_000)
  const recencyNorm = Math.max(0, 1 - hoursOld / 24)

  // Weighted combination
  return (coverageNorm * 0.35) + (tierScore * 0.25) + (reliabilityNorm * 0.20) + (catNorm * 0.15) + (recencyNorm * 0.05)
}
