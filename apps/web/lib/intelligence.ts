import crypto from 'crypto'
import { searchAllSources, analyzeWithVeritas } from './veritas'
import type { SearchArticle, FiveWs } from './veritas'
import { cacheGet, cacheSet } from './redis'

// ─── Types ───────────────────────────────────────────────────────────────────

export type DepthLevel = 'standard' | 'deep' | 'exhaustive'

export type IntelligenceParams = {
  depth_level: DepthLevel
  sources_required: number
  cross_language_analysis: boolean
  fact_check_mode: 'basic' | 'strict' | 'forensic'
  geopolitical_context: boolean
  historical_context_years: number
  contradictory_views: boolean
  scientific_validation: boolean
  timeline_generation: boolean
  disinformation_scan: boolean
}

export type ExpandedFramework = {
  geopolitical_implications: string[]
  historical_timeline_hooks: string[]
  economic_dependencies: string[]
  supply_chain_angles: string[]
  military_implications: string[]
  environmental_consequences: string[]
  strategic_alliances: string[]
  propaganda_analysis_hooks: string[]
}

export type FactVerificationResult = {
  verified_claims: { claim: string; verdict: 'confirmed' | 'disputed' | 'unverified'; evidence: string }[]
  overall_confidence: number
}

export type GeopoliticalResult = {
  power_dynamics: string
  regional_implications: string
  international_actors: string[]
  strategic_significance: string
}

export type EconomicResult = {
  market_impact: string
  affected_sectors: string[]
  supply_chain_exposure: string
  financial_risk_level: 'low' | 'medium' | 'high' | 'critical'
}

export type DisinformationResult = {
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  red_flags: string[]
  propaganda_techniques: string[]
  recommended_verification: string[]
}

export type TimelineEvent = {
  date: string
  event: string
  significance: 'minor' | 'major' | 'pivotal'
}

export type SourceReliabilityScore = {
  source: string
  factual_consistency: number
  historical_reliability: number
  ideological_bias: number
  source_transparency: number
  evidence_quality: number
  overall: number
  classification: 'verified' | 'neutral' | 'unverified' | 'propaganda_risk'
}

export type NarrativeConflict = {
  claim_a: string
  source_a: string
  claim_b: string
  source_b: string
  conflict_type: 'factual' | 'interpretive' | 'omission'
}

export type ResearchChain = {
  topic: string
  angle: 'regulatory' | 'privacy' | 'military' | 'corporate' | 'lobbying' |
         'historical' | 'ethics' | 'public_sentiment' | 'economics' | 'future_risks'
  summary: string
  depth_score: number
}

export type IntelligenceReport = {
  query: string
  params: IntelligenceParams
  expanded_framework: ExpandedFramework
  articolo_consolidato: string
  five_ws: FiveWs
  sources: SearchArticle[]
  fact_verification: FactVerificationResult
  geopolitical_analysis: GeopoliticalResult | null
  economic_intelligence: EconomicResult | null
  disinformation_scan: DisinformationResult | null
  timeline: TimelineEvent[]
  source_reliability_scores: SourceReliabilityScore[]
  narrative_conflicts: NarrativeConflict[]
  research_chains: ResearchChain[]
}

const DEFAULT_PARAMS: IntelligenceParams = {
  depth_level: 'deep',
  sources_required: 12,
  cross_language_analysis: true,
  fact_check_mode: 'strict',
  geopolitical_context: true,
  historical_context_years: 10,
  contradictory_views: true,
  scientific_validation: false,
  timeline_generation: true,
  disinformation_scan: true,
}

// ─── Anthropic helper ────────────────────────────────────────────────────────

async function callClaude(
  model: 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-6',
  maxTokens: number,
  systemPrompt: string,
  userContent: string
): Promise<string> {
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
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    }),
  })
  const data = await res.json()
  return (data.content?.[0]?.text ?? '').replace(/```json?\n?|\n?```/g, '').trim()
}

function articlesContext(articles: SearchArticle[], maxArticles = 8): string {
  return articles.slice(0, maxArticles)
    .map((a, i) => `[${i + 1}] ${a.source}: ${a.content.slice(0, 200)}`)
    .join('\n')
}

function parseJSON<T>(text: string, fallback: T): T {
  try { return JSON.parse(text) as T } catch { return fallback }
}

// ─── Agent functions ──────────────────────────────────────────────────────────

async function expandToFramework(query: string): Promise<ExpandedFramework> {
  const fallback: ExpandedFramework = {
    geopolitical_implications: [], historical_timeline_hooks: [],
    economic_dependencies: [], supply_chain_angles: [], military_implications: [],
    environmental_consequences: [], strategic_alliances: [], propaganda_analysis_hooks: [],
  }
  try {
    const text = await callClaude(
      'claude-haiku-4-5-20251001', 600,
      'You are an intelligence analyst. Generate an investigative research framework as JSON.',
      `Query: "${query}"\n\nReturn JSON with exactly these 8 keys, each an array of 2-3 short strings:\ngeopolitical_implications, historical_timeline_hooks, economic_dependencies, supply_chain_angles, military_implications, environmental_consequences, strategic_alliances, propaganda_analysis_hooks`
    )
    return parseJSON(text, fallback)
  } catch { return fallback }
}

async function runFactVerificationAgent(query: string, articles: SearchArticle[]): Promise<FactVerificationResult> {
  const fallback: FactVerificationResult = { verified_claims: [], overall_confidence: 50 }
  try {
    const text = await callClaude(
      'claude-haiku-4-5-20251001', 800,
      'You are a fact-checking agent. Identify and verify key claims.',
      `Topic: "${query}"\nSources:\n${articlesContext(articles, 6)}\n\nReturn JSON: {"verified_claims":[{"claim":"string","verdict":"confirmed|disputed|unverified","evidence":"brief reason"}],"overall_confidence":0-100}\nMax 5 claims.`
    )
    return parseJSON(text, fallback)
  } catch { return fallback }
}

async function runGeopoliticalAgent(query: string, articles: SearchArticle[]): Promise<GeopoliticalResult> {
  const fallback: GeopoliticalResult = {
    power_dynamics: '', regional_implications: '',
    international_actors: [], strategic_significance: '',
  }
  try {
    const text = await callClaude(
      'claude-sonnet-4-6', 1200,
      'You are a senior geopolitical analyst. Provide structured intelligence analysis.',
      `Topic: "${query}"\nSources:\n${articlesContext(articles, 8)}\n\nReturn JSON: {"power_dynamics":"2-3 sentences","regional_implications":"2-3 sentences","international_actors":["array of key actors"],"strategic_significance":"2-3 sentences"}`
    )
    return parseJSON(text, fallback)
  } catch { return fallback }
}

async function runEconomicAgent(query: string, articles: SearchArticle[]): Promise<EconomicResult> {
  const fallback: EconomicResult = {
    market_impact: '', affected_sectors: [],
    supply_chain_exposure: '', financial_risk_level: 'medium',
  }
  try {
    const text = await callClaude(
      'claude-haiku-4-5-20251001', 800,
      'You are an economic intelligence analyst.',
      `Topic: "${query}"\nSources:\n${articlesContext(articles, 6)}\n\nReturn JSON: {"market_impact":"2 sentences","affected_sectors":["3-5 sectors"],"supply_chain_exposure":"1-2 sentences","financial_risk_level":"low|medium|high|critical"}`
    )
    return parseJSON(text, fallback)
  } catch { return fallback }
}

async function runDisinformationAgent(query: string, articles: SearchArticle[]): Promise<DisinformationResult> {
  const fallback: DisinformationResult = {
    risk_level: 'low', red_flags: [], propaganda_techniques: [], recommended_verification: [],
  }
  try {
    const text = await callClaude(
      'claude-haiku-4-5-20251001', 600,
      'You are a disinformation detection analyst.',
      `Topic: "${query}"\nSources:\n${articlesContext(articles, 6)}\n\nReturn JSON: {"risk_level":"low|medium|high|critical","red_flags":["up to 3 flags"],"propaganda_techniques":["up to 3 techniques if found"],"recommended_verification":["1-2 verification steps"]}`
    )
    return parseJSON(text, fallback)
  } catch { return fallback }
}

async function runTimelineAgent(query: string, articles: SearchArticle[], years: number): Promise<TimelineEvent[]> {
  if (years === 0) return []
  try {
    const text = await callClaude(
      'claude-haiku-4-5-20251001', 800,
      'You are a historical timeline analyst.',
      `Topic: "${query}"\nHistorical context: last ${years} years\nSources:\n${articlesContext(articles, 6)}\n\nReturn JSON array of up to 6 events: [{"date":"YYYY or YYYY-MM","event":"brief description","significance":"minor|major|pivotal"}]`
    )
    const arr = parseJSON<TimelineEvent[]>(text, [])
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

async function runSourceReliabilityAgent(query: string, articles: SearchArticle[]): Promise<SourceReliabilityScore[]> {
  if (!articles.length) return []
  try {
    const sourceList = [...new Set(articles.map((a) => a.source))].slice(0, 8).join(', ')
    const text = await callClaude(
      'claude-haiku-4-5-20251001', 1000,
      'You are a source reliability analyst. Score each news source.',
      `Topic: "${query}"\nSources to evaluate: ${sourceList}\n\nReturn JSON array: [{"source":"name","factual_consistency":0-100,"historical_reliability":0-100,"ideological_bias":0-100,"source_transparency":0-100,"evidence_quality":0-100,"overall":0-100,"classification":"verified|disputed|unverified|propaganda_risk"}]`
    )
    const arr = parseJSON<SourceReliabilityScore[]>(text, [])
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

async function runNarrativeConflictAgent(query: string, articles: SearchArticle[]): Promise<NarrativeConflict[]> {
  if (articles.length < 2) return []
  try {
    const text = await callClaude(
      'claude-haiku-4-5-20251001', 600,
      'You are a narrative conflict analyst. Identify contradictions between sources.',
      `Topic: "${query}"\nSources:\n${articlesContext(articles, 8)}\n\nReturn JSON array of up to 3 conflicts: [{"claim_a":"string","source_a":"string","claim_b":"string","source_b":"string","conflict_type":"factual|interpretive|omission"}]`
    )
    const arr = parseJSON<NarrativeConflict[]>(text, [])
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

async function generateResearchChains(query: string, framework: ExpandedFramework): Promise<ResearchChain[]> {
  try {
    const angles = Object.entries(framework)
      .flatMap(([, v]) => v)
      .slice(0, 6)
      .join('; ')
    const text = await callClaude(
      'claude-haiku-4-5-20251001', 600,
      'You are an intelligence analyst generating research chains for further investigation.',
      `Topic: "${query}"\nKey angles: ${angles}\n\nReturn JSON array of 5 research chains: [{"topic":"specific sub-topic to investigate","angle":"regulatory|privacy|military|corporate|lobbying|historical|ethics|public_sentiment|economics|future_risks","summary":"1 sentence description","depth_score":1-10}]`
    )
    const arr = parseJSON<ResearchChain[]>(text, [])
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

// ─── Main orchestrator ────────────────────────────────────────────────────────

export async function runIntelligencePipeline(
  query: string,
  partialParams: Partial<IntelligenceParams> = {}
): Promise<IntelligenceReport> {
  const params: IntelligenceParams = { ...DEFAULT_PARAMS, ...partialParams }

  // Cache check
  const cacheKey = `intel:v2:${crypto.createHash('md5').update(query + JSON.stringify(params)).digest('hex').slice(0, 12)}`
  try {
    const cached = await cacheGet(cacheKey)
    if (cached) return JSON.parse(cached) as IntelligenceReport
  } catch { /* cache miss */ }

  // Stage 1 — parallel: expand framework + fetch sources
  const [framework, articles] = await Promise.all([
    expandToFramework(query),
    searchAllSources(query),
  ])

  // Stage 2 — core Veritas analysis
  const coreResult = await analyzeWithVeritas(query, articles, 'it')

  // Stage 3 — parallel agents (Wave A: Haiku-only, fast)
  const [factVerif, sourceScores, disinfoResult] = await Promise.all([
    params.fact_check_mode !== 'basic'
      ? runFactVerificationAgent(query, articles)
      : Promise.resolve<FactVerificationResult>({ verified_claims: [], overall_confidence: 0 }),
    runSourceReliabilityAgent(query, articles),
    params.disinformation_scan
      ? runDisinformationAgent(query, articles)
      : Promise.resolve<DisinformationResult>({ risk_level: 'low', red_flags: [], propaganda_techniques: [], recommended_verification: [] }),
  ])

  // Stage 3 — parallel agents (Wave B: includes Sonnet)
  const [geoResult, economicResult, narrativeConflicts, timeline] = await Promise.all([
    params.geopolitical_context
      ? runGeopoliticalAgent(query, articles)
      : Promise.resolve(null),
    runEconomicAgent(query, articles),
    params.contradictory_views
      ? runNarrativeConflictAgent(query, articles)
      : Promise.resolve<NarrativeConflict[]>([]),
    params.timeline_generation
      ? runTimelineAgent(query, articles, params.historical_context_years)
      : Promise.resolve<TimelineEvent[]>([]),
  ])

  // Stage 4 — research chains (depends on framework from Stage 1)
  const researchChains = await generateResearchChains(query, framework)

  const report: IntelligenceReport = {
    query,
    params,
    expanded_framework: framework,
    articolo_consolidato: coreResult.articolo_consolidato,
    five_ws: coreResult.five_ws,
    sources: articles,
    fact_verification: factVerif,
    geopolitical_analysis: geoResult,
    economic_intelligence: economicResult,
    disinformation_scan: disinfoResult,
    timeline,
    source_reliability_scores: sourceScores,
    narrative_conflicts: narrativeConflicts,
    research_chains: researchChains,
  }

  // Cache result
  try {
    await cacheSet(cacheKey, JSON.stringify(report), 3600)
  } catch { /* non-critical */ }

  return report
}
