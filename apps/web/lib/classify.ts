type CategoryWeights = {
  saturate: number
  primary: string[]
  secondary: string[]
}

const CATEGORY_WEIGHTS: Record<string, CategoryWeights> = {
  breaking: {
    saturate: 15,
    primary: ['breaking news', 'breaking:', 'urgent', 'alert:', 'just in'],
    secondary: ['developing', 'update:', 'live:'],
  },
  conflitti: {
    saturate: 40,
    primary: ['war', 'airstrike', 'invasion', 'ceasefire', 'missile strike', 'bombing', 'troops deployed', 'military offensive'],
    secondary: ['conflict', 'attack', 'military', 'troops', 'bomb', 'battle', 'killed', 'fighting', 'casualties', 'hostilities', 'weapons', 'artillery', 'drone strike', 'occupation'],
  },
  politica: {
    saturate: 40,
    primary: ['election', 'prime minister', 'president signs', 'parliament votes', 'diplomatic talks', 'sanctions imposed', 'treaty signed'],
    secondary: ['government', 'minister', 'senate', 'vote', 'political', 'diplomat', 'legislation', 'congress', 'coalition', 'referendum', 'summit', 'bilateral'],
  },
  economia: {
    saturate: 40,
    primary: ['interest rate', 'gdp growth', 'stock market', 'trade war', 'inflation rate', 'central bank', 'financial crisis', 'tariff'],
    secondary: ['economy', 'market', 'trade', 'finance', 'inflation', 'bank', 'crypto', 'bitcoin', 'recession', 'investment', 'unemployment', 'currency', 'oil price'],
  },
  tecnologia: {
    saturate: 35,
    primary: ['artificial intelligence', 'ai model', 'chatgpt', 'openai', 'machine learning', 'cybersecurity breach', 'data breach', 'tech giant'],
    secondary: ['technology', 'digital', 'software', 'startup', 'apple', 'google', 'meta', 'microsoft', 'nvidia', 'cyber', 'algorithm', 'quantum', 'chip', 'semiconductor'],
  },
  scienza: {
    saturate: 35,
    primary: ['scientific study', 'new research', 'space mission', 'nasa launches', 'discovery scientists', 'clinical trial', 'peer reviewed'],
    secondary: ['science', 'research', 'study', 'space', 'nasa', 'discovery', 'physics', 'biology', 'asteroid', 'planet', 'experiment', 'genome', 'fossil'],
  },
  salute: {
    saturate: 35,
    primary: ['health warning', 'disease outbreak', 'vaccine approved', 'pandemic', 'who warns', 'public health emergency', 'drug approval'],
    secondary: ['health', 'medical', 'disease', 'vaccine', 'hospital', 'cancer', 'virus', 'covid', 'mental health', 'treatment', 'drug', 'mortality', 'epidemic'],
  },
  ambiente: {
    saturate: 35,
    primary: ['climate change', 'global warming', 'carbon emissions', 'renewable energy', 'wildfire', 'flood', 'deforestation', 'cop28', 'net zero'],
    secondary: ['climate', 'environment', 'carbon', 'emissions', 'renewable', 'drought', 'pollution', 'glacier', 'sea level', 'ecosystem', 'species extinction'],
  },
  sport: {
    saturate: 40,
    primary: ['champions league', 'world cup', 'premier league', 'serie a', 'nba finals', 'grand slam', 'formula 1', 'olympic games', 'europa league', 'superbowl'],
    secondary: ['football', 'soccer', 'tennis', 'championship', 'league', 'nba', 'nfl', 'fifa', 'tournament', 'match', 'goal', 'player', 'team wins', 'squad'],
  },
  cultura: {
    saturate: 30,
    primary: ['oscar winner', 'grammy award', 'book prize', 'film festival', 'exhibition opens', 'concert tour', 'bestseller'],
    secondary: ['culture', 'art', 'film', 'music', 'book', 'award', 'festival', 'cinema', 'literature', 'theater', 'artist', 'director', 'album'],
  },
}

export type ClassificationResult = {
  category: string
  confidence: number
  scores: Record<string, number>
}

export function classifyArticle(title: string, summary: string): ClassificationResult {
  const text = (title + ' ' + summary).toLowerCase()
  const scores: Record<string, number> = {}

  for (const [cat, weights] of Object.entries(CATEGORY_WEIGHTS)) {
    let raw = 0
    for (const kw of weights.primary) {
      if (text.includes(kw)) raw += 10
    }
    for (const kw of weights.secondary) {
      if (text.includes(kw)) raw += 4
    }
    scores[cat] = Math.min(Math.round((raw / weights.saturate) * 100), 100)
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const [topCat, topScore] = sorted[0]

  if (topScore >= 70) {
    return { category: topCat, confidence: topScore, scores }
  }
  if (topScore >= 45) {
    return { category: topCat, confidence: topScore, scores }
  }
  return { category: 'cronaca', confidence: topScore, scores }
}

export function geoClassify(title: string, summary: string): string {
  const t = (title + ' ' + summary).toLowerCase()
  if (/israel|palestin|iran|iraq|syria|saudi arabia|lebanon|jordan|yemen|persian gulf|middle east|hamas|hezbollah|gaza|west bank|tehran|riyadh/.test(t)) return 'medio-oriente'
  if (/\bchina\b|japan|india|\bsouth korea\b|\bnorth korea\b|taiwan|hong kong|singapore|myanmar|thailand|vietnam|beijing|tokyo|new delhi|pakistan|bangladesh/.test(t)) return 'asia'
  if (/russia|ukraine|european union|\beu summit\b|brussels|nato|france|germany|italy|spain|\bunited kingdom\b|\buk\b|britain|poland|hungary|türkiye|turkey|nordic|scandinavia/.test(t)) return 'europa'
  if (/united states|white house|washington d\.c\.|congress|trump|biden|harris|pentagon|canada|mexico|brazil|argentina|colombia|latin america|chile|venezuela/.test(t)) return 'americhe'
  if (/\bafrica\b|nigeria|ethiopia|kenya|south africa|egypt|sudan|ghana|tanzania|congo|somalia|senegal|morocco|tunisia|sahel/.test(t)) return 'africa'
  if (/australia|new zealand|\bpacific islands\b|oceania|papua new guinea/.test(t)) return 'oceania'
  return 'mondo'
}

export function relevanceScore(text: string, query: string): number {
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2)
  if (words.length === 0) return 0
  const t = text.toLowerCase()
  const matched = words.filter((w) => t.includes(w))
  return matched.length / words.length
}
