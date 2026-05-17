// ─────────────────────────────────────────────────────────────────────────────
// Policy editoriale del feed "Mondo".
//
// L'utente apre la dashboard Lens Veritas e vede notizie globalmente rilevanti,
// NON cronaca di Cosenza. Le regole qui implementate sono:
//
//   1) sourceScope === 'local'         -> sempre escluso (ANSA regionali, La Presse local)
//   2) sourceScope === 'international' -> sempre ammesso (BBC World, Reuters, ANSA Mondo)
//   3) sourceScope === 'national'      -> ammesso SOLO se globalImpactScore >= 6
//   4) sourceScope === undefined       -> fail-open ammesso (cache legacy senza il campo, dura ~5 min dopo deploy)
//
// La logica e' separata da lib/rss.ts (I/O RSS) per testabilita' e per non sporcare
// il fetch con policy editoriale che evolvera' nel tempo.
// ─────────────────────────────────────────────────────────────────────────────

// Subset di Article che basta a tutte le decisioni del filtro Mondo.
// Le funzioni qui accettano qualsiasi T che soddisfi questo shape (generic safe
// per l'integrazione con geoPersonalizedArticles in lib/trends.ts, che usa proprio
// un generic T extends {...} non identico ad Article).
type WorldFilterShape = {
  title?: string
  summary?: string
  sourceScope?: 'local' | 'national' | 'international'
  sourceCountry?: string
  sourceGlobalTier?: 1 | 2 | 3
  sourceReliability?: number
}

// Soglia minima per ammettere una notizia nazionale (italiana o canadese) nel feed Mondo.
// Calibrata empiricamente: un articolo che parla SOLO di G7 ottiene 3, +1 reliability+1 tier = 5,
// quindi serve qualcosa in piu' (es. "G7 vertice Roma"+keyword Vaticano) per superare. Una notizia
// generica "Meloni parla in Aula" prende 0 e viene scartata, come desiderato.
const NATIONAL_ADMIT_THRESHOLD = 6

// ─── Pattern keyword per globalImpactScore ────────────────────────────────────
// Tutti applicati case-insensitive su (title + ' ' + summary).
const RE_INSTITUTIONS = /\b(g7|g20|g-7|g-20|onu|un security council|unsc|nato|otan|imf|fmi|world bank|banca mondiale|eu summit|vertice ue|consiglio europeo|wto|ocse|oecd|cop\s*\d+)\b/i
const RE_VATICAN      = /\b(vatican|vaticano|papa|pope|papal|santa sede|holy see|conclave|cardinal[ei])\b/i
const RE_ELECTIONS    = /\b(election|elections|elezioni|vote|votes|voto|voting|ballot|presidential|presidenziali|election day|polls\s*close|primaries|primarie|presidenziali|parlamentari)\b/i
const RE_FIN_CRISIS   = /\b(financial crisis|crisi finanziaria|sovereign debt|debito sovrano|default|recession|recessione|spread|junk rating|rating downgrade|bailout|bond yields|inflation surge|shock energetico|stagflation)\b/i
const RE_TIER1_COUNTRY = /\b(united states|usa|stati uniti|america|china|cina|russia|germany|germania|france|francia|united kingdom|britain|uk|gran bretagna|japan|giappone|india|brazil|brasile|italy|italia|spain|spagna)\b/i

/**
 * Punteggio 0-10 di impatto globale per un articolo.
 * Heuristic puramente keyword-based, niente AI (volutamente economico).
 * v2: embedding cached se la heuristic mostra troppi falsi negativi.
 */
export function globalImpactScore(a: WorldFilterShape): number {
  const text = `${a.title ?? ''} ${a.summary ?? ''}`.toLowerCase()
  let score = 0
  if (RE_INSTITUTIONS.test(text)) score += 3
  if (RE_VATICAN.test(text))      score += 2
  // Elezioni rilevano solo se citano anche un paese tier-1 (evita "elezioni regionali in Veneto")
  if (RE_ELECTIONS.test(text) && RE_TIER1_COUNTRY.test(text)) score += 2
  if (RE_FIN_CRISIS.test(text))   score += 2
  if ((a.sourceReliability ?? 0) >= 8.5) score += 1
  if (a.sourceGlobalTier === 1 || a.sourceGlobalTier === 2) score += 1
  return Math.min(score, 10)
}

/**
 * Decide se un articolo puo' apparire nel feed Mondo.
 * Vedi commento di file in cima per le regole.
 */
export function isWorldEligible(a: WorldFilterShape): boolean {
  // Hard exclude: feed locali (ANSA regionali, La Presse Régional/Insolite/Education)
  if (a.sourceScope === 'local') return false

  // Internazionali: sempre ammessi (BBC World, Reuters, ANSA Mondo, La Presse International)
  if (a.sourceScope === 'international') return true

  // National (ANSA italiana, quotidiani italiani, La Presse Affaires/Sports): solo se impatto globale
  if (a.sourceScope === 'national') return globalImpactScore(a) >= NATIONAL_ADMIT_THRESHOLD

  // Undefined (cache legacy serializzata prima della migrazione): fail-open per non spezzare la UX
  // durante i ~5 min tra deploy e prossimo cron refresh-feeds.
  return true
}

/**
 * Soft cap per chiave (tipicamente sourceCountry): scorre gli articoli in ordine
 * di input e scarta quelli che superano il cap del proprio gruppo.
 * Usato per evitare che USA o UK dominino il feed Mondo (cap default = 8).
 * L'ordine relativo dei rimanenti viene preservato (stabile).
 */
export function capByCountry<T>(items: T[], cap: number, key: (x: T) => string): T[] {
  const counter = new Map<string, number>()
  const out: T[] = []
  for (const it of items) {
    const k = key(it) || '__unknown__'
    const c = counter.get(k) ?? 0
    if (c >= cap) continue
    counter.set(k, c + 1)
    out.push(it)
  }
  return out
}

/**
 * Applica l'intera pipeline editoriale del feed Mondo: filtro + cap per paese.
 * L'ordine in input dovrebbe essere gia' rilevanza-DESC (oppure pubDate-DESC),
 * cosi' il cap-per-paese scarta gli articoli meno rilevanti del paese saturo.
 */
export function applyWorldFilter<T extends WorldFilterShape>(
  articles: T[],
  opts?: { capPerCountry?: number },
): T[] {
  const filtered = articles.filter(isWorldEligible)
  return capByCountry(filtered, opts?.capPerCountry ?? 8, (a) => a.sourceCountry ?? '')
}

/**
 * Boost di ranking per fonti Tier-1 internazionali. Usato dentro geoPersonalizedArticles
 * quando worldMode=true. Non e' una funzione di filter ma un moltiplicatore di score.
 */
export function worldTierBoost(a: WorldFilterShape): number {
  if (a.sourceGlobalTier === 1) return 1.4
  if (a.sourceGlobalTier === 2) return 1.15
  return 1.0
}
