import Parser from 'rss-parser'
import { classifyArticle, geoClassify } from './classify'
import { cacheGet, cacheSet, cacheSetMany, cacheDel } from './redis'
import { articleId } from './encode'
// GDELT Project: fonte news aggiuntiva con query tematiche (15 min refresh)
import { fetchGdeltArticles } from './gdelt'
import { ITALIAN_FEEDS } from './feeds-it'

// v5: +75 feed (ANSA estese + La Presse Canada), invalida cache post-deploy
const ARTICLES_FRESH_KEY = 'nlv_articles_v5'
const ARTICLES_STALE_KEY = 'nlv_articles_v5_stale'
const ARTICLES_CACHE_TTL = 600   // 10 min fresh
const ARTICLES_STALE_TTL = 1800  // 30 min stale
const ARTICLE_BY_ID_TTL = 86400  // 24h: cache singolo articolo per lookup da URL
// Per-feed health snapshot: aggiornato ad ogni fetchArticlesFresh, consumato dall'admin dashboard
export const FEEDS_STATUS_KEY = 'nlv_feeds_status_v1'
const FEEDS_STATUS_TTL = 3600    // 1h: vogliamo conservare l'ultimo esito anche se il refresh fallisce

const parser = new Parser({
  timeout: 8000,
  headers: { 'User-Agent': 'NewsLensVeritas/1.0' },
})

// Limite concorrente per fetch HTTP paralleli. Su Vercel Node runtime il limite
// di file descriptor e' circa 100. Lanciare 80+ feed in parallelo causava
// "EMFILE: too many open files" e crash 500. 10 paralleli sono safe e veloci
// abbastanza (80 feed / 10 = 8 batch da ~1.5s = ~12s totali).
const FETCH_CONCURRENCY = 10

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = []
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency)
    const settled = await Promise.allSettled(chunk.map(fn))
    results.push(...settled)
  }
  return results
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// Dedup semantico: due titoli che descrivono la stessa notizia (anche con parole
// diverse) vengono riconosciuti come duplicati confrontando i bigrammi di parole.
// Esempio: "Trump impone dazi alla Cina" e "Trump tariffs against China" non
// matchano (lingue diverse, intenzionale), ma "Trump tariffs China record" e
// "Trump imposes record tariffs on Chinese goods" sì.
// Soglia 0.55: 55% di bigrammi in comune = stessa storia.
// ─────────────────────────────────────────────────────────────────────────────
const SAME_STORY_THRESHOLD = 0.55

function titleBigrams(title: string): Set<string> {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9àèéìòùáéíóúäöüñç ]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2)   // salta articoli/preposizioni corte
  const bg = new Set<string>()
  for (let i = 0; i < words.length - 1; i++) bg.add(`${words[i]}_${words[i + 1]}`)
  return bg
}

function jaccardSim(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  for (const x of a) if (b.has(x)) inter++
  return inter / (a.size + b.size - inter)
}

// Rimuove articoli che raccontano la stessa storia di un altro gia tenuto.
// Input: array ordinato per data DESC (i piu recenti vincono).
function dedupSameStory(sorted: Article[]): Article[] {
  const kept: Article[] = []
  const keptBigrams: Set<string>[] = []
  for (const a of sorted) {
    const bg = titleBigrams(a.title)
    let dup = false
    for (let i = keptBigrams.length - 1; i >= 0; i--) {
      if (jaccardSim(bg, keptBigrams[i]) >= SAME_STORY_THRESHOLD) {
        dup = true
        break
      }
    }
    if (!dup) {
      kept.push(a)
      keptBigrams.push(bg)
    }
  }
  return kept
}

export type FeedMeta = {
  id: string
  source: string
  url: string
  country: string
  region: string
  type: string
  bias: string
  reliability: number
  aiValue: string
  antiBiasValue: string
  // Scope editoriale: regola l'ammissibilita' nel feed Mondo (vedi lib/world-filter.ts).
  // - local: news territoriali (ANSA regionali, La Presse régional) -> sempre escluse da Mondo
  // - national: testate nazionali (ANSA Top, Corriere) -> ammesse in Mondo solo se globalImpactScore >= 6
  // - international: feed con vocazione globale (BBC World, Reuters) -> sempre ammessi in Mondo
  scope: 'local' | 'national' | 'international'
  // Tier di rilevanza geopolitica delle fonti internazionali. Default implicito: 3.
  // Tier 1 (Reuters/BBC/AP/Guardian/AlJazeera/...) riceve boost x1.4 nel ranking world.
  globalTier?: 1 | 2 | 3
}

// Esito per singolo feed dell'ultimo fetch (popolato da fetchArticlesFresh, letto da /api/admin/dashboard)
export type FeedStatus = {
  id: string
  source: string
  success: boolean
  fetchedAt: string         // ISO timestamp del termine del fetch
  durationMs: number
  count: number             // # item restituiti dal feed (post slice(0,12), pre-dedup globale)
  latestPubDate: string | null
  error: string | null
}

export type Article = {
  id: string  // hash stabile del link, usato come URL slug e Redis key
  title: string
  link: string
  pubDate: string
  source: string
  summary: string
  category: string
  geo: string
  // Metadati fonte
  sourceBias: string
  sourceReliability: number
  sourceType: string
  // Scope editoriale propagato dal FeedMeta. Opzionale per retrocompatibilita' con la cache
  // Redis legacy (gli articoli serializzati prima di questa migrazione non hanno il campo);
  // in lib/world-filter.ts trattiamo undefined come 'international' (fail-open).
  sourceScope?: 'local' | 'national' | 'international'
  sourceCountry?: string
  sourceGlobalTier?: 1 | 2 | 3
  // ─── Campi AI (popolati dal cron /api/cron/classify-articles) ──────────────
  // Tutti opzionali per retrocompatibilita': la cache Redis nlv_articles_v5 ha
  // articoli pre-AI per ~ore dopo il deploy. Quando l'AI flag e' off, questi
  // campi sono sempre undefined.
  aiCategory?: string
  aiCategoriesSecondary?: string[]
  aiGeoScope?: string
  aiGlobalImpactScore?: number
  aiGlobalImpactReasoning?: string
  aiWorldEligible?: boolean
  aiConfidence?: number
  aiFlags?: string[]
}

// Scope+globalTier per il filtro Mondo (vedi lib/world-filter.ts):
// - local        -> escluso da Mondo (ANSA regionali, La Presse régional/insolite/education)
// - national     -> ammesso solo se globalImpactScore >= 6 (testate nazionali italiane)
// - international+tier 1 -> sempre ammesso, boost ×1.4 nel ranking world (Reuters, BBC, AP, Guardian, AlJazeera, DW, France24, SCMP, Bellingcat)
// - international+tier 2 -> sempre ammesso, boost ×1.15 (NYT World, ANSAMed, La Presse International, RT, think tank)
// - international+tier 3 -> sempre ammesso, no boost (vertical/specialized: tech, scienza, sport)
export const FEEDS: FeedMeta[] = [
  // Agenzie / Mainstream globali
  { id: 'bbc_world',      source: 'BBC World News',          url: 'http://feeds.bbci.co.uk/news/world/rss.xml',              country: 'UK',            region: 'europe',     type: 'mainstream',    bias: 'center',        reliability: 8.8, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 1 },
  { id: 'reuters_world',  source: 'Reuters',                 url: 'https://feeds.reuters.com/Reuters/worldNews',             country: 'USA',           region: 'americhe',   type: 'mainstream',    bias: 'center',        reliability: 9.2, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 1 },
  { id: 'ap_news',        source: 'Associated Press',        url: 'https://apnews.com/hub/ap-top-news/rss.xml',              country: 'USA',           region: 'americhe',   type: 'mainstream',    bias: 'center',        reliability: 9.0, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 1 },
  { id: 'al_jazeera',     source: 'Al Jazeera',              url: 'https://www.aljazeera.com/xml/rss/all.xml',               country: 'Qatar',         region: 'medio-oriente', type: 'mainstream', bias: 'mixed',        reliability: 8.0, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 1 },
  { id: 'dw_world',       source: 'Deutsche Welle',          url: 'https://rss.dw.com/xml/rss-en-all',                       country: 'Germany',       region: 'europa',     type: 'government',    bias: 'center',        reliability: 8.5, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 1 },
  { id: 'france24',       source: 'France 24',               url: 'https://www.france24.com/en/rss',                         country: 'France',        region: 'europa',     type: 'government',    bias: 'center',        reliability: 8.3, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 1 },
  { id: 'guardian_world', source: 'The Guardian',            url: 'https://www.theguardian.com/world/rss',                   country: 'UK',            region: 'europa',     type: 'mainstream',    bias: 'center-left',   reliability: 8.4, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 1 },
  { id: 'nyt_world',      source: 'New York Times',          url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',  country: 'USA',           region: 'americhe',   type: 'mainstream',    bias: 'center-left',   reliability: 8.7, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 2 },
  { id: 'scmp',           source: 'South China Morning Post',url: 'https://www.scmp.com/rss/91/feed',                        country: 'Hong Kong',     region: 'asia',       type: 'mainstream',    bias: 'mixed',         reliability: 7.8, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 1 },
  { id: 'rt_world',       source: 'RT News',                 url: 'https://www.rt.com/rss/news/',                            country: 'Russia',        region: 'europa',     type: 'government',    bias: 'state-aligned', reliability: 5.0, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 2 },
  // Tecnologia
  { id: 'ars_technica',   source: 'Ars Technica',            url: 'http://feeds.arstechnica.com/arstechnica/index',          country: 'USA',           region: 'americhe',   type: 'independent',   bias: 'center-left',   reliability: 8.8, aiValue: 'high', antiBiasValue: 'medium', scope: 'international', globalTier: 3 },
  { id: 'techcrunch',     source: 'TechCrunch',              url: 'https://techcrunch.com/feed/',                            country: 'USA',           region: 'americhe',   type: 'mainstream',    bias: 'center-left',   reliability: 7.8, aiValue: 'high', antiBiasValue: 'medium', scope: 'international', globalTier: 3 },
  { id: 'mit_tech',       source: 'MIT Technology Review',   url: 'https://www.technologyreview.com/feed/',                  country: 'USA',           region: 'americhe',   type: 'university',    bias: 'center',        reliability: 9.0, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 2 },
  { id: 'wired',          source: 'WIRED',                   url: 'https://www.wired.com/feed/rss',                          country: 'USA',           region: 'americhe',   type: 'mainstream',    bias: 'center-left',   reliability: 8.0, aiValue: 'high', antiBiasValue: 'medium', scope: 'international', globalTier: 3 },
  // Cybersecurity
  { id: 'hacker_news',    source: 'The Hacker News',         url: 'https://feeds.feedburner.com/TheHackersNews',             country: 'India',         region: 'asia',       type: 'independent',   bias: 'center',        reliability: 8.2, aiValue: 'high', antiBiasValue: 'medium', scope: 'international', globalTier: 3 },
  { id: 'bleeping',       source: 'BleepingComputer',        url: 'https://www.bleepingcomputer.com/feed/',                  country: 'USA',           region: 'americhe',   type: 'independent',   bias: 'center',        reliability: 8.7, aiValue: 'high', antiBiasValue: 'medium', scope: 'international', globalTier: 3 },
  // Investigative / Fact-checking
  { id: 'bellingcat',     source: 'Bellingcat',              url: 'https://www.bellingcat.com/feed/',                        country: 'Netherlands',   region: 'europa',     type: 'investigative', bias: 'center-left',   reliability: 8.8, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 1 },
  { id: 'snopes',         source: 'Snopes',                  url: 'https://www.snopes.com/feed/',                            country: 'USA',           region: 'americhe',   type: 'fact_checking', bias: 'center-left',   reliability: 8.5, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 3 },
  { id: 'politifact',     source: 'PolitiFact',              url: 'https://www.politifact.com/rss/all/',                     country: 'USA',           region: 'americhe',   type: 'fact_checking', bias: 'center',        reliability: 8.6, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 3 },
  // Think tank / Policy
  { id: 'brookings',      source: 'Brookings Institution',   url: 'https://www.brookings.edu/feed/',                        country: 'USA',           region: 'americhe',   type: 'think_tank',    bias: 'center-left',   reliability: 9.0, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 2 },
  { id: 'rand',           source: 'RAND Corporation',        url: 'https://www.rand.org/topics.rss.xml',                     country: 'USA',           region: 'americhe',   type: 'think_tank',    bias: 'center',        reliability: 9.1, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 2 },
  // Crypto / Finance
  { id: 'cointelegraph',  source: 'Cointelegraph',           url: 'https://cointelegraph.com/rss',                           country: 'Global',        region: 'mondo',      type: 'independent',   bias: 'mixed',         reliability: 7.0, aiValue: 'medium', antiBiasValue: 'medium', scope: 'international', globalTier: 3 },
  // Scienza / Salute
  { id: 'nasa_news',      source: 'NASA',                    url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',          country: 'USA',           region: 'americhe',   type: 'government',    bias: 'center',        reliability: 9.5, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 3 },
  { id: 'who_news',       source: 'WHO',                     url: 'https://www.who.int/feeds/entity/news/en/rss.xml',        country: 'International', region: 'mondo',      type: 'government',    bias: 'center',        reliability: 9.3, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 2 },
  // ANSA — Italia (testate nazionali italiane: scope national, ammesse in Mondo solo se globalImpactScore >= 6)
  { id: 'ansa_top',       source: 'ANSA',                    url: 'https://www.ansa.it/sito/notizie/topnews/topnews_rss.xml',      country: 'Italy', region: 'europa',   type: 'mainstream',  bias: 'center',      reliability: 8.5, aiValue: 'high', antiBiasValue: 'high', scope: 'national' },
  { id: 'ansa_mondo',     source: 'ANSA Mondo',              url: 'https://www.ansa.it/sito/notizie/mondo/mondo_rss.xml',          country: 'Italy', region: 'mondo',    type: 'mainstream',  bias: 'center',      reliability: 8.5, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 3 },
  { id: 'ansa_politica',  source: 'ANSA Politica',           url: 'https://www.ansa.it/sito/notizie/politica/politica_rss.xml',    country: 'Italy', region: 'europa',   type: 'mainstream',  bias: 'center',      reliability: 8.5, aiValue: 'high', antiBiasValue: 'high', scope: 'national' },
  { id: 'ansa_economia',  source: 'ANSA Economia',           url: 'https://www.ansa.it/sito/notizie/economia/economia_rss.xml',    country: 'Italy', region: 'europa',   type: 'mainstream',  bias: 'center',      reliability: 8.5, aiValue: 'high', antiBiasValue: 'high', scope: 'national' },
  { id: 'ansa_tech',      source: 'ANSA Tecnologia',         url: 'https://www.ansa.it/sito/notizie/tecnologia/tecnologia_rss.xml',country: 'Italy', region: 'europa',   type: 'mainstream',  bias: 'center',      reliability: 8.3, aiValue: 'high', antiBiasValue: 'medium', scope: 'national' },
  { id: 'ansa_sport',     source: 'ANSA Sport',              url: 'https://www.ansa.it/sito/notizie/sport/sport_rss.xml',          country: 'Italy', region: 'europa',   type: 'mainstream',  bias: 'center',      reliability: 8.3, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'ansa_salute',    source: 'ANSA Salute',             url: 'https://www.ansa.it/sito/notizie/salute/salute_rss.xml',        country: 'Italy', region: 'europa',   type: 'mainstream',  bias: 'center',      reliability: 8.5, aiValue: 'high', antiBiasValue: 'high', scope: 'national' },
  { id: 'ansa_ambiente',  source: 'ANSA Ambiente',           url: 'https://www.ansa.it/sito/notizie/ambiente/ambiente_rss.xml',    country: 'Italy', region: 'europa',   type: 'mainstream',  bias: 'center',      reliability: 8.3, aiValue: 'high', antiBiasValue: 'high', scope: 'national' },
  { id: 'ansa_cultura',   source: 'ANSA Cultura',            url: 'https://www.ansa.it/sito/notizie/lifestyle/lifestyle_rss.xml',  country: 'Italy', region: 'europa',   type: 'mainstream',  bias: 'center',      reliability: 8.0, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  // ─── Quotidiani e testate italiane — Esteri/Mondo ─────────────────────────
  // Tutte scope national: ammesse in Mondo solo se globalImpactScore >= 6 (G7, ONU, Vaticano, crisi finanziaria nazionale...)
  { id: 'corriere_esteri',  source: 'Corriere della Sera',  url: 'https://xml2.corriereobjects.it/rss/esteri.xml',    country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center',       reliability: 8.3, aiValue: 'high',   antiBiasValue: 'high',   scope: 'national' },
  { id: 'repubblica_mondo', source: 'la Repubblica',         url: 'https://www.repubblica.it/rss/esteri/rss2.0.xml',   country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center-left',  reliability: 8.2, aiValue: 'high',   antiBiasValue: 'high',   scope: 'national' },
  { id: 'sole24ore_mondo',  source: 'Il Sole 24 Ore',        url: 'https://www.ilsole24ore.com/rss/mondo.xml',         country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center-right', reliability: 8.4, aiValue: 'high',   antiBiasValue: 'high',   scope: 'national' },
  { id: 'lastampa_mondo',   source: 'La Stampa',             url: 'https://www.lastampa.it/rss/esteri',                country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center-left',  reliability: 7.9, aiValue: 'high',   antiBiasValue: 'high',   scope: 'national' },
  { id: 'fattoquotidiano',  source: 'Il Fatto Quotidiano',   url: 'https://www.ilfattoquotidiano.it/feed/',            country: 'Italy', region: 'europa', type: 'mainstream', bias: 'left',         reliability: 7.2, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'huffpost_it',      source: 'HuffPost Italia',       url: 'https://www.huffingtonpost.it/feeds/index.xml',     country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center-left',  reliability: 7.5, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'skytg24_mondo',    source: 'Sky TG24',              url: 'https://tg24.sky.it/mondo/rss.xml',                 country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center',       reliability: 8.0, aiValue: 'high',   antiBiasValue: 'high',   scope: 'national' },
  { id: 'adnkronos',        source: 'Adnkronos',             url: 'https://www.adnkronos.com/rss/world_rss.php',       country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center',       reliability: 7.8, aiValue: 'high',   antiBiasValue: 'high',   scope: 'national' },
  { id: 'messaggero_mondo', source: 'Il Messaggero',         url: 'https://www.ilmessaggero.it/rss/mondo.xml',         country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center',       reliability: 7.7, aiValue: 'high',   antiBiasValue: 'high',   scope: 'national' },
  { id: 'open_online',      source: 'Open Online',           url: 'https://www.open.online/feed/',                     country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center-left',  reliability: 7.6, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },

  // ─── ANSA — Sezioni nazionali aggiuntive ──────────────────────────────────
  // Tutte scope national (Cronaca italiana, cultura italiana, motori italiani...)
  { id: 'ansa_home',         source: 'ANSA Homepage',     url: 'https://www.ansa.it/sito/ansait_rss.xml',                            country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.5, aiValue: 'high',   antiBiasValue: 'high',   scope: 'national' },
  { id: 'ansa_cronaca',      source: 'ANSA Cronaca',      url: 'https://www.ansa.it/sito/notizie/cronaca/cronaca_rss.xml',           country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'high',   antiBiasValue: 'high',   scope: 'national' },
  { id: 'ansa_calcio',       source: 'ANSA Calcio',       url: 'https://www.ansa.it/sito/notizie/sport/calcio/calcio_rss.xml',       country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.0, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'ansa_cinema',       source: 'ANSA Cinema',       url: 'https://www.ansa.it/sito/notizie/cultura/cinema/cinema_rss.xml',     country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.0, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'ansa_cultura_t',    source: 'ANSA Cultura',      url: 'https://www.ansa.it/sito/notizie/cultura/cultura_rss.xml',           country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'ansa_motori',       source: 'ANSA Motori',       url: 'https://www.ansa.it/canale_motori/notizie/motori_rss.xml',           country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.0, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'ansa_terra_gusto',  source: 'ANSA Terra&Gusto',  url: 'https://www.ansa.it/canale_terraegusto/notizie/terraegusto_rss.xml', country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.0, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'ansa_scienza',      source: 'ANSA Scienza',      url: 'https://www.ansa.it/canale_scienza_tecnica/notizie/scienzaetecnica_rss.xml', country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.5, aiValue: 'high',   antiBiasValue: 'high',   scope: 'national' },
  { id: 'ansa_viaggi',       source: 'ANSA Viaggi',       url: 'https://www.ansa.it/canale_viaggi/notizie/viaggiart_rss.xml',        country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 7.8, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'ansa_golf',         source: 'ANSA Golf',         url: 'https://www.ansa.it/golf/notizie/golf_rss.xml',                      country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 7.8, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },

  // ─── ANSA — Edizioni regionali (20 regioni italiane) ──────────────────────
  // Tutte scope local: sempre escluse dal feed Mondo (sono la causa principale del problema "Cosenza incidente tangenziale" mescolato a Reuters)
  { id: 'ansa_abruzzo',       source: 'ANSA Abruzzo',          url: 'https://www.ansa.it/abruzzo/notizie/abruzzo_rss.xml',                  country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'medium', antiBiasValue: 'high', scope: 'local' },
  { id: 'ansa_basilicata',    source: 'ANSA Basilicata',       url: 'https://www.ansa.it/basilicata/notizie/basilicata_rss.xml',            country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'medium', antiBiasValue: 'high', scope: 'local' },
  { id: 'ansa_calabria',      source: 'ANSA Calabria',         url: 'https://www.ansa.it/calabria/notizie/calabria_rss.xml',                country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'medium', antiBiasValue: 'high', scope: 'local' },
  { id: 'ansa_campania',      source: 'ANSA Campania',         url: 'https://www.ansa.it/campania/notizie/campania_rss.xml',                country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'medium', antiBiasValue: 'high', scope: 'local' },
  { id: 'ansa_emiliaromagna', source: 'ANSA Emilia-Romagna',   url: 'https://www.ansa.it/emiliaromagna/notizie/emiliaromagna_rss.xml',      country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'medium', antiBiasValue: 'high', scope: 'local' },
  { id: 'ansa_fvg',           source: 'ANSA Friuli Venezia Giulia', url: 'https://www.ansa.it/friuliveneziagiulia/notizie/friuliveneziagiulia_rss.xml', country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'medium', antiBiasValue: 'high', scope: 'local' },
  { id: 'ansa_lazio',         source: 'ANSA Lazio',            url: 'https://www.ansa.it/lazio/notizie/lazio_rss.xml',                      country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'medium', antiBiasValue: 'high', scope: 'local' },
  { id: 'ansa_liguria',       source: 'ANSA Liguria',          url: 'https://www.ansa.it/liguria/notizie/liguria_rss.xml',                  country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'medium', antiBiasValue: 'high', scope: 'local' },
  { id: 'ansa_lombardia',     source: 'ANSA Lombardia',        url: 'https://www.ansa.it/lombardia/notizie/lombardia_rss.xml',              country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'medium', antiBiasValue: 'high', scope: 'local' },
  { id: 'ansa_marche',        source: 'ANSA Marche',           url: 'https://www.ansa.it/marche/notizie/marche_rss.xml',                    country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'medium', antiBiasValue: 'high', scope: 'local' },
  { id: 'ansa_molise',        source: 'ANSA Molise',           url: 'https://www.ansa.it/molise/notizie/molise_rss.xml',                    country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'medium', antiBiasValue: 'high', scope: 'local' },
  { id: 'ansa_piemonte',      source: 'ANSA Piemonte',         url: 'https://www.ansa.it/piemonte/notizie/piemonte_rss.xml',                country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'medium', antiBiasValue: 'high', scope: 'local' },
  { id: 'ansa_puglia',        source: 'ANSA Puglia',           url: 'https://www.ansa.it/puglia/notizie/puglia_rss.xml',                    country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'medium', antiBiasValue: 'high', scope: 'local' },
  { id: 'ansa_sardegna',      source: 'ANSA Sardegna',         url: 'https://www.ansa.it/sardegna/notizie/sardegna_rss.xml',                country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'medium', antiBiasValue: 'high', scope: 'local' },
  { id: 'ansa_sicilia',       source: 'ANSA Sicilia',          url: 'https://www.ansa.it/sicilia/notizie/sicilia_rss.xml',                  country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'medium', antiBiasValue: 'high', scope: 'local' },
  { id: 'ansa_toscana',       source: 'ANSA Toscana',          url: 'https://www.ansa.it/toscana/notizie/toscana_rss.xml',                  country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'medium', antiBiasValue: 'high', scope: 'local' },
  { id: 'ansa_trentino',      source: 'ANSA Trentino Alto Adige', url: 'https://www.ansa.it/trentino/notizie/trentino_rss.xml',             country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'medium', antiBiasValue: 'high', scope: 'local' },
  { id: 'ansa_umbria',        source: 'ANSA Umbria',           url: 'https://www.ansa.it/umbria/notizie/umbria_rss.xml',                    country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'medium', antiBiasValue: 'high', scope: 'local' },
  { id: 'ansa_vda',           source: 'ANSA Valle d’Aosta', url: 'https://www.ansa.it/valledaosta/notizie/valledaosta_rss.xml',         country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'medium', antiBiasValue: 'high', scope: 'local' },
  { id: 'ansa_veneto',        source: 'ANSA Veneto',           url: 'https://www.ansa.it/veneto/notizie/veneto_rss.xml',                    country: 'Italy', region: 'europa', type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'medium', antiBiasValue: 'high', scope: 'local' },

  // ─── ANSA — Edizioni internazionali e in lingua estera ────────────────────
  // Scope international tier 2: edizioni geo-specifiche di ANSA che parlano di esteri/regioni del mondo
  { id: 'ansa_english',       source: 'ANSA English',          url: 'https://www.ansa.it/english/news/english_nr_rss.xml',                  country: 'Italy', region: 'europa',         type: 'mainstream', bias: 'center', reliability: 8.5, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 2 },
  { id: 'ansa_europa',        source: 'ANSA Europa UE',        url: 'https://www.ansa.it/europa/notizie/rss.xml',                           country: 'Italy', region: 'europa',         type: 'mainstream', bias: 'center', reliability: 8.5, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 2 },
  { id: 'ansamed_it',         source: 'ANSAMed',               url: 'https://www.ansa.it/ansamed/it/rss.xml',                               country: 'Italy', region: 'medio-oriente',  type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 2 },
  { id: 'ansamed_ar',         source: 'ANSAMed Arabic',        url: 'https://www.ansa.it/ansamednew/ar/notizie/ansamedar_nr_rss.xml',       country: 'Italy', region: 'medio-oriente',  type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 2 },
  { id: 'ansa_nuovaeuropa_it',source: 'ANSA Nuova Europa',     url: 'https://www.ansa.it/nuova_europa/it/rss.xml',                          country: 'Italy', region: 'europa',         type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 2 },
  { id: 'ansa_nuovaeuropa_en',source: 'ANSA Nuova Europa (EN)',url: 'https://www.ansa.it/nuova_europa/en/rss.xml',                          country: 'Italy', region: 'europa',         type: 'mainstream', bias: 'center', reliability: 8.3, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 2 },
  { id: 'ansa_brasil',        source: 'ANSA Brasil',           url: 'https://www.ansa.it/brasil/noticias/ind_nr_rss.xml',                   country: 'Italy', region: 'americhe',       type: 'mainstream', bias: 'center', reliability: 8.0, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 2 },
  { id: 'ansa_latina',        source: 'ANSA Latina',           url: 'https://www.ansa.it/americalatina/noticia/al_nr_rss.xml',              country: 'Italy', region: 'americhe',       type: 'mainstream', bias: 'center', reliability: 8.0, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 2 },
  { id: 'ansa_china',         source: 'ANSA China',            url: 'https://www.ansa.it/china/notizie/china_nr_rss.xml',                   country: 'Italy', region: 'asia',           type: 'mainstream', bias: 'center', reliability: 8.0, aiValue: 'high', antiBiasValue: 'high', scope: 'international', globalTier: 2 },

  // ─── La Presse Canada — Actualités (notizie generali in francese) ─────────
  // Régional/Insolite/Education: scope local (sempre escluso da Mondo). Altri: national canadese.
  { id: 'lapresse_actu',        source: 'La Presse',                 url: 'https://www.lapresse.ca/actualites/rss',                country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 8.2, aiValue: 'high',   antiBiasValue: 'high',   scope: 'national' },
  { id: 'lapresse_environnement', source: 'La Presse Environnement', url: 'https://www.lapresse.ca/actualites/environnement/rss',  country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 8.2, aiValue: 'high',   antiBiasValue: 'high',   scope: 'national' },
  { id: 'lapresse_politique',   source: 'La Presse Politique',       url: 'https://www.lapresse.ca/actualites/politique/rss',      country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 8.2, aiValue: 'high',   antiBiasValue: 'high',   scope: 'national' },
  { id: 'lapresse_national',    source: 'La Presse National',        url: 'https://www.lapresse.ca/actualites/national/rss',       country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 8.2, aiValue: 'high',   antiBiasValue: 'high',   scope: 'national' },
  { id: 'lapresse_sante_a',     source: 'La Presse Santé',           url: 'https://www.lapresse.ca/actualites/sante/rss',          country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 8.2, aiValue: 'high',   antiBiasValue: 'high',   scope: 'national' },
  { id: 'lapresse_education',   source: 'La Presse Éducation',       url: 'https://www.lapresse.ca/actualites/education/rss',      country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 8.2, aiValue: 'medium', antiBiasValue: 'high',   scope: 'local' },
  { id: 'lapresse_enquetes',    source: 'La Presse Enquêtes',        url: 'https://www.lapresse.ca/actualites/enquetes/rss',       country: 'Canada', region: 'americhe', type: 'investigative', bias: 'center-left', reliability: 8.5, aiValue: 'high',   antiBiasValue: 'high', scope: 'national' },
  { id: 'lapresse_regional',    source: 'La Presse Régional',        url: 'https://www.lapresse.ca/actualites/regional/rss',       country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 8.0, aiValue: 'medium', antiBiasValue: 'high',   scope: 'local' },
  { id: 'lapresse_insolite',    source: 'La Presse Insolite',        url: 'https://www.lapresse.ca/actualites/insolite/rss',       country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 7.5, aiValue: 'medium', antiBiasValue: 'medium', scope: 'local' },
  { id: 'lapresse_sciences',    source: 'La Presse Sciences',        url: 'https://www.lapresse.ca/actualites/sciences/rss',       country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 8.5, aiValue: 'high',   antiBiasValue: 'high',   scope: 'national' },

  // ─── La Presse Canada — Affaires (business/economia) ──────────────────────
  // Scope national canadese: ammessi in Mondo solo se globalImpactScore alto
  { id: 'lapresse_affaires',    source: 'La Presse Affaires',        url: 'https://www.lapresse.ca/affaires/rss',                            country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 8.2, aiValue: 'high',   antiBiasValue: 'high',   scope: 'national' },
  { id: 'lapresse_economie',    source: 'La Presse Économie',        url: 'https://www.lapresse.ca/affaires/economie/rss',                   country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 8.2, aiValue: 'high',   antiBiasValue: 'high',   scope: 'national' },
  { id: 'lapresse_entreprises', source: 'La Presse Entreprises',     url: 'https://www.lapresse.ca/affaires/entreprises/rss',                country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 8.0, aiValue: 'high',   antiBiasValue: 'high',   scope: 'national' },
  { id: 'lapresse_techno',      source: 'La Presse Techno',          url: 'https://www.lapresse.ca/affaires/techno/rss',                     country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 8.0, aiValue: 'high',   antiBiasValue: 'medium', scope: 'national' },
  { id: 'lapresse_finperso',    source: 'La Presse Finances Persos', url: 'https://www.lapresse.ca/affaires/finances-personnelles/rss',      country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 8.0, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'lapresse_medias',      source: 'La Presse Médias',          url: 'https://www.lapresse.ca/affaires/medias/rss',                     country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 8.0, aiValue: 'medium', antiBiasValue: 'high',   scope: 'national' },
  { id: 'lapresse_pme',         source: 'La Presse PME',             url: 'https://www.lapresse.ca/affaires/pme/rss',                        country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 7.8, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'lapresse_portfolio',   source: 'La Presse Portfolio',       url: 'https://www.lapresse.ca/affaires/portfolio/rss',                  country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 7.8, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'lapresse_grande_ent',  source: 'La Presse Grande Entrevue', url: 'https://www.lapresse.ca/affaires/grande-entrevue/rss',            country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 8.0, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'lapresse_tetes',       source: 'La Presse Têtes d’affiche', url: 'https://www.lapresse.ca/affaires/tetes-daffiche/rss',         country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 7.8, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },

  // ─── La Presse Canada — International ─────────────────────────────────────
  // Sezioni geo-specifiche internazionali: scope international tier 2
  { id: 'lapresse_int',         source: 'La Presse International',   url: 'https://www.lapresse.ca/international/rss',                       country: 'Canada', region: 'mondo',           type: 'mainstream', bias: 'center-left', reliability: 8.2, aiValue: 'high',   antiBiasValue: 'high',   scope: 'international', globalTier: 2 },
  { id: 'lapresse_usa',         source: 'La Presse USA',             url: 'https://www.lapresse.ca/international/etats-unis/rss',            country: 'Canada', region: 'americhe',        type: 'mainstream', bias: 'center-left', reliability: 8.2, aiValue: 'high',   antiBiasValue: 'high',   scope: 'international', globalTier: 2 },
  { id: 'lapresse_eu',          source: 'La Presse Europe',          url: 'https://www.lapresse.ca/international/europe/rss',                country: 'Canada', region: 'europa',          type: 'mainstream', bias: 'center-left', reliability: 8.2, aiValue: 'high',   antiBiasValue: 'high',   scope: 'international', globalTier: 2 },
  { id: 'lapresse_mo',          source: 'La Presse Moyen-Orient',    url: 'https://www.lapresse.ca/international/moyen-orient/rss',          country: 'Canada', region: 'medio-oriente',   type: 'mainstream', bias: 'center-left', reliability: 8.2, aiValue: 'high',   antiBiasValue: 'high',   scope: 'international', globalTier: 2 },
  { id: 'lapresse_asia_oc',     source: 'La Presse Asie-Océanie',    url: 'https://www.lapresse.ca/international/asie-et-oceanie/rss',       country: 'Canada', region: 'asia',            type: 'mainstream', bias: 'center-left', reliability: 8.2, aiValue: 'high',   antiBiasValue: 'high',   scope: 'international', globalTier: 2 },
  { id: 'lapresse_afrique',     source: 'La Presse Afrique',         url: 'https://www.lapresse.ca/international/afrique/rss',               country: 'Canada', region: 'africa',          type: 'mainstream', bias: 'center-left', reliability: 8.2, aiValue: 'high',   antiBiasValue: 'high',   scope: 'international', globalTier: 2 },
  { id: 'lapresse_amlat',       source: 'La Presse Amérique Latine', url: 'https://www.lapresse.ca/international/amerique-latine/rss',       country: 'Canada', region: 'americhe',        type: 'mainstream', bias: 'center-left', reliability: 8.0, aiValue: 'high',   antiBiasValue: 'high',   scope: 'international', globalTier: 2 },
  { id: 'lapresse_caraibes',    source: 'La Presse Caraïbes',        url: 'https://www.lapresse.ca/international/caraibes/rss',              country: 'Canada', region: 'americhe',        type: 'mainstream', bias: 'center-left', reliability: 8.0, aiValue: 'medium', antiBiasValue: 'high',   scope: 'international', globalTier: 2 },

  // ─── La Presse Canada — Sports ────────────────────────────────────────────
  // Scope national: lo sport locale (hockey/baseball/NFL) entra in Mondo solo se Olympics/World Cup/finali mondiali
  { id: 'lapresse_sports',      source: 'La Presse Sports',          url: 'https://www.lapresse.ca/sports/rss',                              country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 7.8, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'lapresse_hockey',      source: 'La Presse Hockey',          url: 'https://www.lapresse.ca/sports/hockey/rss',                       country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 7.8, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'lapresse_soccer',      source: 'La Presse Soccer',          url: 'https://www.lapresse.ca/sports/soccer/rss',                       country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 7.8, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'lapresse_nfl',         source: 'La Presse Football US',     url: 'https://www.lapresse.ca/sports/football/rss',                     country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 7.8, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'lapresse_tennis',      source: 'La Presse Tennis',          url: 'https://www.lapresse.ca/sports/tennis/rss',                       country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 7.8, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'lapresse_baseball',    source: 'La Presse Baseball',        url: 'https://www.lapresse.ca/sports/baseball/rss',                     country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 7.8, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'lapresse_basketball',  source: 'La Presse Basketball',      url: 'https://www.lapresse.ca/sports/basketball/rss',                   country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 7.8, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'lapresse_golf',        source: 'La Presse Golf',            url: 'https://www.lapresse.ca/sports/golf/rss',                         country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 7.8, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'lapresse_combat',      source: 'La Presse Sports de Combat',url: 'https://www.lapresse.ca/sports/sports-de-combat/rss',             country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 7.8, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
  { id: 'lapresse_cyclisme',    source: 'La Presse Cyclisme',        url: 'https://www.lapresse.ca/sports/cyclisme/rss',                     country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 7.8, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },

  // ─── La Presse Canada — Société ───────────────────────────────────────────
  { id: 'lapresse_societe_sante', source: 'La Presse Société Santé', url: 'https://www.lapresse.ca/societe/sante/rss',                       country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 8.2, aiValue: 'high',   antiBiasValue: 'high',   scope: 'national' },
  { id: 'lapresse_cinema',      source: 'La Presse Cinéma',          url: 'https://www.lapresse.ca/cinema/rss',                              country: 'Canada', region: 'americhe', type: 'mainstream', bias: 'center-left', reliability: 7.8, aiValue: 'medium', antiBiasValue: 'medium', scope: 'national' },
]

// Categoria predefinita per feed-source: l'origine del feed sa gia' di cosa parla.
// I feed assenti da questa mappa (BBC World, Reuters, ANSA Top, ANSA Home, ANSA English,
// Il Fatto, HuffPost, Open, fattoquotidiano) sono generici e usano il classifier euristico.
// Per gli altri si usa direttamente questa categoria, evitando misclassificazioni del tipo
// "ANSA Sport titolo cripto -> cronaca".
const FEED_DEFAULT_CATEGORY: Record<string, string> = {
  // ─── Esteri (World feeds) ────────────────────────────────────────────────
  bbc_world: 'esteri', reuters_world: 'esteri', ap_news: 'esteri',
  al_jazeera: 'esteri', dw_world: 'esteri', france24: 'esteri',
  guardian_world: 'esteri', nyt_world: 'esteri', scmp: 'esteri', rt_world: 'esteri',
  ansa_mondo: 'esteri', corriere_esteri: 'esteri', repubblica_mondo: 'esteri',
  sole24ore_mondo: 'esteri', lastampa_mondo: 'esteri', skytg24_mondo: 'esteri',
  adnkronos: 'esteri', messaggero_mondo: 'esteri',
  ansamed_it: 'esteri', ansamed_ar: 'esteri',
  ansa_nuovaeuropa_it: 'esteri', ansa_nuovaeuropa_en: 'esteri',
  ansa_brasil: 'esteri', ansa_latina: 'esteri', ansa_china: 'esteri',
  lapresse_int: 'esteri', lapresse_usa: 'esteri', lapresse_eu: 'esteri',
  lapresse_mo: 'esteri', lapresse_asia_oc: 'esteri', lapresse_afrique: 'esteri',
  lapresse_amlat: 'esteri', lapresse_caraibes: 'esteri',

  // ─── Politica ────────────────────────────────────────────────────────────
  ansa_politica: 'politica', ansa_europa: 'politica',
  bellingcat: 'politica', politifact: 'politica',
  brookings: 'politica', rand: 'politica',
  lapresse_politique: 'politica',

  // ─── Economia ────────────────────────────────────────────────────────────
  ansa_economia: 'economia', cointelegraph: 'economia',
  lapresse_affaires: 'economia', lapresse_economie: 'economia',
  lapresse_entreprises: 'economia', lapresse_finperso: 'economia',
  lapresse_pme: 'economia', lapresse_portfolio: 'economia',
  lapresse_grande_ent: 'economia', lapresse_tetes: 'economia',

  // ─── Tecnologia ──────────────────────────────────────────────────────────
  ars_technica: 'tecnologia', techcrunch: 'tecnologia', mit_tech: 'tecnologia',
  wired: 'tecnologia', hacker_news: 'tecnologia', bleeping: 'tecnologia',
  ansa_tech: 'tecnologia', lapresse_techno: 'tecnologia',
  // Feed tematici tech da lib/feeds-it.ts
  sole_tech: 'tecnologia', internetto: 'tecnologia', androidiani: 'tecnologia',
  spaziogames: 'tecnologia', whatstech: 'tecnologia',
  fsf_news: 'tecnologia', linux_journal: 'tecnologia', nintendo_life: 'tecnologia',

  // ─── Sport ───────────────────────────────────────────────────────────────
  ansa_sport: 'sport', ansa_calcio: 'sport', ansa_golf: 'sport',
  lapresse_sports: 'sport', lapresse_hockey: 'sport', lapresse_soccer: 'sport',
  lapresse_nfl: 'sport', lapresse_tennis: 'sport', lapresse_baseball: 'sport',
  lapresse_basketball: 'sport', lapresse_golf: 'sport',
  lapresse_combat: 'sport', lapresse_cyclisme: 'sport',
  // Feed sport italiani da lib/feeds-it.ts (prima cadevano nel fallback euristico
  // -> "cronaca" -> sparivano dalla home box Sport)
  gazzetta_home: 'sport', sole_sport: 'sport',

  // ─── Salute ──────────────────────────────────────────────────────────────
  who_news: 'salute', ansa_salute: 'salute',
  lapresse_sante_a: 'salute', lapresse_societe_sante: 'salute',
  sole_salute: 'salute',

  // ─── Scienza ─────────────────────────────────────────────────────────────
  nasa_news: 'scienza', ansa_scienza: 'scienza', lapresse_sciences: 'scienza',
  oggi_scienza: 'scienza', sapere_scienza: 'scienza',

  // ─── Ambiente ────────────────────────────────────────────────────────────
  ansa_ambiente: 'ambiente', lapresse_environnement: 'ambiente',
  ansa_terragusto: 'ambiente',

  // ─── Economia (feed tematici da lib/feeds-it.ts) ─────────────────────────
  sole_finanza: 'economia', sole_tributi: 'economia',
  sole_risparmio: 'economia', sole_management: 'economia',

  // ─── Cultura ─────────────────────────────────────────────────────────────
  ansa_cultura: 'cultura', ansa_cultura_t: 'cultura',
  ansa_cinema: 'cultura', ansa_viaggi: 'cultura',
  lapresse_cinema: 'cultura', lapresse_medias: 'cultura',
  // Feed cultura/lifestyle italiani da lib/feeds-it.ts
  ansa_cultura_v2: 'cultura', sole_cultura: 'cultura', sole_arteconomy: 'cultura',
  sole_moda: 'cultura', sole_food: 'cultura', sole_viaggi: 'cultura',
  musicoff: 'cultura', giallo_zaffer: 'cultura',

  // ─── Cronaca (locale italiana + La Presse locale Quebec) ─────────────────
  snopes: 'cronaca',
  ansa_cronaca: 'cronaca', ansa_motori: 'cronaca', ansa_terra_gusto: 'cronaca',
  ansa_abruzzo: 'cronaca', ansa_basilicata: 'cronaca', ansa_calabria: 'cronaca',
  ansa_campania: 'cronaca', ansa_emiliaromagna: 'cronaca', ansa_emilia: 'cronaca', ansa_fvg: 'cronaca',
  ansa_lazio: 'cronaca', ansa_liguria: 'cronaca', ansa_lombardia: 'cronaca',
  ansa_marche: 'cronaca', ansa_molise: 'cronaca', ansa_piemonte: 'cronaca',
  ansa_puglia: 'cronaca', ansa_sardegna: 'cronaca', ansa_sicilia: 'cronaca',
  ansa_toscana: 'cronaca', ansa_trentino: 'cronaca', ansa_umbria: 'cronaca',
  ansa_vda: 'cronaca', ansa_veneto: 'cronaca',
  lapresse_actu: 'cronaca', lapresse_national: 'cronaca',
  lapresse_education: 'cronaca', lapresse_enquetes: 'cronaca',
  lapresse_regional: 'cronaca', lapresse_insolite: 'cronaca',
}

function categorize(feedId: string, title: string, summary: string): string {
  // 1) Hint forte dal source feed (es. "ANSA Sport" -> sport, NASA -> scienza)
  const fromFeed = FEED_DEFAULT_CATEGORY[feedId]
  if (fromFeed) return fromFeed
  // 2) Fallback: classifier euristico su title+summary (per feed generici tipo BBC World, Reuters)
  return classifyArticle(title, summary).category
}

async function fetchFromNewsAPI(): Promise<Article[]> {
  try {
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?pageSize=30&language=it&apiKey=${process.env.NEWS_API_KEY}`,
      { next: { revalidate: 300 } }
    )
    const data = await res.json()
    if (data.status !== 'ok') return []
    return data.articles
      .filter((a: { title?: string; url?: string }) => a.title && a.url && a.title !== '[Removed]')
      .map((a: { title: string; url: string; publishedAt: string; source: { name: string }; description?: string }) => {
        const title = stripHtml(a.title)
        const summary = stripHtml(a.description ?? '')
        return {
          id: articleId(a.url),
          title, link: a.url, pubDate: a.publishedAt,
          source: a.source.name, summary,
          category: categorize('', title, summary),
          geo: geoClassify(title, summary),
          sourceBias: 'unknown', sourceReliability: 7.0, sourceType: 'mainstream',
          // NewsAPI e' un proxy generico: assumiamo international tier 3 finche' non sappiamo di piu'
          sourceScope: 'international' as const, sourceGlobalTier: 3 as const,
        }
      })
  } catch { return [] }
}

async function fetchFromGuardianAPI(): Promise<Article[]> {
  try {
    const res = await fetch(
      `https://content.guardianapis.com/search?api-key=${process.env.GUARDIAN_API_KEY}&page-size=30&order-by=newest&show-fields=trailText`,
      { next: { revalidate: 300 } }
    )
    const data = await res.json()
    if (data.response?.status !== 'ok') return []
    return data.response.results.map((a: { webTitle: string; webUrl: string; webPublicationDate: string; fields?: { trailText?: string } }) => {
      const title = stripHtml(a.webTitle)
      const summary = stripHtml(a.fields?.trailText ?? '')
      return {
        id: articleId(a.webUrl),
        title, link: a.webUrl, pubDate: a.webPublicationDate,
        source: 'The Guardian', summary,
        category: categorize('', title, summary),
        geo: geoClassify(title, summary),
        sourceBias: 'center-left', sourceReliability: 8.4, sourceType: 'mainstream',
        // Guardian API: tier 1 globale
        sourceScope: 'international' as const, sourceCountry: 'UK', sourceGlobalTier: 1 as const,
      }
    })
  } catch { return [] }
}

async function fetchFromGNews(): Promise<Article[]> {
  try {
    const res = await fetch(
      `https://gnews.io/api/v4/top-headlines?token=${process.env.GNEWS_API_KEY}&max=20&lang=it`,
      { next: { revalidate: 300 } }
    )
    const data = await res.json()
    if (!data.articles) return []
    return data.articles.map((a: { title: string; url: string; publishedAt: string; source: { name: string }; description?: string }) => {
      const title = stripHtml(a.title)
      const summary = stripHtml(a.description ?? '')
      return {
        id: articleId(a.url),
        title, link: a.url, pubDate: a.publishedAt,
        source: a.source.name, summary,
        category: categorize('', title, summary),
        geo: geoClassify(title, summary),
        sourceBias: 'unknown', sourceReliability: 7.0, sourceType: 'mainstream',
        // GNews e' un proxy generico: international tier 3
        sourceScope: 'international' as const, sourceGlobalTier: 3 as const,
      }
    })
  } catch { return [] }
}

export async function fetchArticlesFresh(): Promise<Article[]> {
  // Snapshot per-feed: popolato dentro la mappa qui sotto e flushato su Redis a fine funzione
  const perFeedStatus: FeedStatus[] = []

  // Fetch parallelo di tutte le fonti — ogni fonte ha il proprio fail-safe
  // RSS feeds processati in batch da FETCH_CONCURRENCY per evitare EMFILE
  const [rssResults, newsApiArticles, guardianArticles, gnewsArticles, gdeltArticles] = await Promise.all([
    mapWithConcurrency(FEEDS, FETCH_CONCURRENCY, async (feed) => {
        const start = Date.now()
        try {
          const f = await parser.parseURL(feed.url)
          const articles: Article[] = f.items.slice(0, 12).map((item): Article => {
            const title = stripHtml(item.title ?? '')
            const summary = stripHtml(item.contentSnippet ?? item.summary ?? '')
            const link = item.link ?? ''
            return {
              id: articleId(link),
              title,
              link,
              pubDate: item.pubDate ?? item.isoDate ?? '',
              source: feed.source,
              summary,
              category: categorize(feed.id, title, summary),
              geo: geoClassify(title, summary, feed.scope, feed.country),
              sourceBias: feed.bias,
              sourceReliability: feed.reliability,
              sourceType: feed.type,
              sourceScope: feed.scope,
              sourceCountry: feed.country,
              sourceGlobalTier: feed.globalTier,
            }
          })
          // pubDate piu recente trovata nel feed (alcuni item potrebbero non averla)
          let latest: string | null = null
          for (const a of articles) {
            if (!a.pubDate) continue
            if (!latest || new Date(a.pubDate).getTime() > new Date(latest).getTime()) latest = a.pubDate
          }
          perFeedStatus.push({
            id: feed.id, source: feed.source,
            success: true,
            fetchedAt: new Date().toISOString(),
            durationMs: Date.now() - start,
            count: articles.length,
            latestPubDate: latest,
            error: null,
          })
          return articles
        } catch (e) {
          perFeedStatus.push({
            id: feed.id, source: feed.source,
            success: false,
            fetchedAt: new Date().toISOString(),
            durationMs: Date.now() - start,
            count: 0,
            latestPubDate: null,
            error: ((e as Error)?.message ?? String(e)).slice(0, 240),
          })
          throw e
        }
      }),
    fetchFromNewsAPI(),
    fetchFromGuardianAPI(),
    fetchFromGNews(),
    // GDELT Project con query tematiche predefinite — fail-safe interno
    fetchGdeltArticles().catch((err) => {
      console.warn('[GDELT] pipeline call failed:', (err as Error).message)
      return [] as Article[]
    }),
  ])

  const rssArticles = rssResults
    .filter((r): r is PromiseFulfilledResult<Article[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)

  const all = [...rssArticles, ...newsApiArticles, ...guardianArticles, ...gnewsArticles, ...gdeltArticles]
    .filter((a) => a.title && a.link)

  // Dedup livello 1 — prefisso titolo (cattura duplicati esatti o quasi)
  const seen = new Set<string>()
  const prefixDeduped = all.filter((a) => {
    const key = a.title.toLowerCase().slice(0, 60)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Sort per data decrescente prima della dedup semantica
  // (cosi il primo "rappresentante" di una storia e' sempre il piu recente)
  const sorted = prefixDeduped.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  )

  // Dedup livello 2 — semantica (Jaccard bigrammi), riconosce "stessa storia, parole diverse"
  const articles = dedupSameStory(sorted)

  // Indicizza ogni articolo su Redis per lookup veloce dalla pagina /articolo/[id]
  // Bulk via Upstash pipeline: una singola HTTP request per tutti i SET.
  // Il vecchio loop senza await apriva un socket per articolo (~500) causando EMFILE.
  await cacheSetMany(
    articles.map((a) => ({
      key: `art:${a.id}`,
      value: JSON.stringify(a),
      ttlSeconds: ARTICLE_BY_ID_TTL,
    })),
  ).catch(() => {})

  // Flush stato per-feed: l'admin dashboard lo legge per mostrare ultimo fetch ed errori
  cacheSet(FEEDS_STATUS_KEY, JSON.stringify(perFeedStatus), FEEDS_STATUS_TTL).catch(() => {})

  return articles
}

// Invalida cache feed homepage/news (fresh + stale). Gli articoli singoli
// art:<id> restano in cache 24h per consentire la pagina /articolo/[id]
export async function invalidateArticleCache(): Promise<void> {
  await Promise.all([
    cacheDel(ARTICLES_FRESH_KEY).catch(() => {}),
    cacheDel(ARTICLES_STALE_KEY).catch(() => {}),
  ])
}

export async function fetchArticles(): Promise<Article[]> {
  // 1. fresh cache (<10 min)
  try {
    const fresh = await cacheGet(ARTICLES_FRESH_KEY)
    if (fresh) return JSON.parse(fresh) as Article[]
  } catch { }
  // 2. stale cache (<30 min) + background refresh (non-blocking)
  try {
    const stale = await cacheGet(ARTICLES_STALE_KEY)
    if (stale) {
      fetchArticlesFresh().then(f => {
        cacheSet(ARTICLES_FRESH_KEY, JSON.stringify(f), ARTICLES_CACHE_TTL).catch(() => {})
        cacheSet(ARTICLES_STALE_KEY, JSON.stringify(f), ARTICLES_STALE_TTL).catch(() => {})
      }).catch(() => {})
      return JSON.parse(stale) as Article[]
    }
  } catch { }
  // 3. cold fetch — writes both keys
  const articles = await fetchArticlesFresh()
  cacheSet(ARTICLES_FRESH_KEY, JSON.stringify(articles), ARTICLES_CACHE_TTL).catch(() => {})
  cacheSet(ARTICLES_STALE_KEY, JSON.stringify(articles), ARTICLES_STALE_TTL).catch(() => {})
  return articles
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min}m fa`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h fa`
  return `${Math.floor(h / 24)}g fa`
}

export function biasColor(bias: string): string {
  const map: Record<string, string> = {
    'center': 'text-green-400',
    'center-left': 'text-blue-400',
    'center-right': 'text-orange-400',
    'left': 'text-blue-600',
    'right': 'text-red-500',
    'state-aligned': 'text-red-400',
    'mixed': 'text-yellow-400',
    'unknown': 'text-gray-400',
  }
  return map[bias] ?? 'text-gray-400'
}
