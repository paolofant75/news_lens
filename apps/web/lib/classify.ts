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
  // Esteri: cattura affari internazionali / diplomazia / politica estera quando il feed
  // di origine non e' gia stato classificato come "esteri" tramite FEED_DEFAULT_CATEGORY
  esteri: {
    saturate: 30,
    primary: ['foreign minister', 'ambassador', 'un security council', 'eu summit', 'nato summit', 'g7 summit', 'g20 summit', 'state department', 'foreign policy'],
    secondary: ['esteri', 'foreign affairs', 'international', 'diplomatic', 'embassy', 'consulate', 'bilateral', 'treaty', 'sanctions', 'geopolitical'],
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

export function geoClassify(
  title: string,
  summary: string,
  // Hint dal feed di origine: se il titolo non matcha alcun continente E il source e' italian local/national,
  // forziamo 'europa' invece del fallback generico 'mondo'. Risolve il "Cosenza problem" (citta' italiane
  // piccole non presenti nel regex europa cadevano nel fallback 'mondo' inquinando il feed globale).
  sourceScope?: 'local' | 'national' | 'international',
  sourceCountry?: string,
): string {
  const t = (title + ' ' + summary).toLowerCase()

  // Medio Oriente — molto specifico, va prima
  if (/israel|palestin|iran|iraq|syria|saudi arabia|lebanon|jordan|yemen|persian gulf|middle east|hamas|hezbollah|gaza|west bank|tehran|riyadh|tel aviv|netanyahu|khamenei|idf|mossad|ayatollah|sunni|shia|abu dhabi|dubai|qatar|kuwait|bahrain|oman|isil|isis|daesh/.test(t)) return 'medio-oriente'

  // Asia — città, persone, istituzioni
  if (/\bchina\b|japan|india|\bsouth korea\b|\bnorth korea\b|taiwan|hong kong|singapore|myanmar|thailand|vietnam|beijing|tokyo|new delhi|mumbai|shanghai|seoul|pyongyang|xi jinping|modi|abe|kishida|kim jong|jakarta|manila|kuala lumpur|dhaka|islamabad|karachi|colombo|kathmandu|cambodia|laos|indonesia|pakistan|bangladesh|sri lanka|nepal|bhutan|afghanistan|mongolia|uzbekistan|kazakhstan/.test(t)) return 'asia'

  // Europa — paesi, città, persone, sport, istituzioni
  if (/russia|ukraine|european union|\beu summit\b|brussels|nato|france|germany|italy|spain|\bunited kingdom\b|\buk\b|britain|poland|hungary|türkiye|turkey|nordic|scandinavia|paris|berlin|rome|madrid|london|amsterdam|vienna|warsaw|budapest|stockholm|oslo|copenhagen|helsinki|lisbon|athens|prague|bucharest|zagreb|belgrade|sofia|putin|zelensky|macron|scholz|meloni|sanchez|sunak|starmer|orbán|tusk|premier league|fa cup|bundesliga|serie a|la liga|ligue 1|eredivisie|tottenham|arsenal|chelsea|liverpool|manchester|leeds|everton|newcastle|juventus|milan|inter|roma|barcelona|real madrid|atletico|psg|bayern|borussia|ajax|ansa|quirinale|parlamento italiano|senato italiano|camera dei deputati|bce|banca d'europa|camorra|mafia|ndrangheta/.test(t)) return 'europa'

  // Americhe — stati USA, persone, istituzioni
  if (/united states|white house|washington d\.c\.|congress|trump|biden|harris|pentagon|canada|mexico|brazil|argentina|colombia|latin america|chile|venezuela|alabama|alaska|arizona|california|colorado|florida|georgia|illinois|iowa|michigan|minnesota|new york|ohio|oklahoma|oregon|pennsylvania|tennessee|texas|virginia|wisconsin|supreme court|federal reserve|republican|democrat|fbi|cia|doj|nsa|senate|house of representatives|wall street|new york stock|nasdaq|ottawa|trudeau|brasilia|lula|buenos aires|bogota|caracas|havana|cuba|haiti|jamaica|san francisco|los angeles|chicago|houston|miami|boston|seattle|new england|nba|nfl|mlb|nhl|super bowl|nascar/.test(t)) return 'americhe'

  // Africa
  if (/\bafrica\b|nigeria|ethiopia|kenya|south africa|egypt|sudan|ghana|tanzania|congo|somalia|senegal|morocco|tunisia|sahel|mali|niger|burkina faso|mozambique|zimbabwe|rwanda|uganda|cameroon|angola|zambia|zimbabwe|lagos|nairobi|cairo|addis ababa|dakar|kinshasa|african union/.test(t)) return 'africa'

  // Oceania
  if (/australia|new zealand|\bpacific islands\b|oceania|papua new guinea|fiji|samoa|tonga|vanuatu|solomon islands|sydney|melbourne|canberra|auckland|wellington|scott morrison|albanese/.test(t)) return 'oceania'

  // Cosenza-problem fallback: il titolo non matcha alcun continente, ma il source e' italiano local/national.
  // Cronaca regionale italiana o testata italiana che parla di cose italiane senza citta' grosse va in 'europa',
  // NON nel bucket 'mondo' (che dev'essere riservato a news veramente globali/internazionali).
  if (sourceCountry === 'Italy' && (sourceScope === 'local' || sourceScope === 'national')) return 'europa'
  if (sourceCountry === 'Canada' && (sourceScope === 'local' || sourceScope === 'national')) return 'americhe'

  return 'mondo'
}

export function relevanceScore(text: string, query: string): number {
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2)
  if (words.length === 0) return 0
  const t = text.toLowerCase()
  const matched = words.filter((w) => t.includes(w))
  return matched.length / words.length
}
