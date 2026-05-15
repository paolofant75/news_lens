export type TaxNode = {
  id: string
  label: string
  icon?: string
  level: number
  keywords: string[]
  children?: TaxNode[]
  type?: 'static' | 'dynamic' | 'ai' | 'advanced'
}

export const TAXONOMY: TaxNode[] = [
  {
    id: 'breaking', label: 'Breaking News', icon: '🔴', level: 1, type: 'static',
    keywords: ['breaking', 'urgent', 'alert', 'just in'],
    children: [
      { id: 'breaking_live', label: 'Live Events', level: 2, keywords: ['live', 'happening now', 'real-time', 'developing'] },
      { id: 'breaking_crisis', label: 'Crisi & Emergenze', level: 2, keywords: ['crisis', 'emergency', 'disaster', 'evacuate', 'shelter'] },
    ],
  },
  {
    id: 'geopolitics', label: 'Geopolitica & Conflitti', icon: '🌐', level: 1, type: 'static',
    keywords: ['geopolitics', 'diplomatic', 'conflict', 'war', 'military', 'troops'],
    children: [
      {
        id: 'geo_usa', label: 'USA', level: 2, keywords: ['united states', 'usa', 'trump', 'washington', 'congress', 'pentagon'],
        children: [
          { id: 'usa_elections', label: 'Elezioni USA', level: 3, keywords: ['election', 'vote', 'democrat', 'republican', 'ballot', 'campaign'] },
          { id: 'usa_ai_policy', label: 'AI Policy', level: 3, keywords: ['ai regulation', 'tech policy', 'executive order', 'senate ai'] },
          { id: 'usa_trade', label: 'Tariffe & Commercio', level: 3, keywords: ['tariff', 'trade war', 'sanctions', 'import duty'] },
        ],
      },
      {
        id: 'geo_china', label: 'Cina', level: 2, keywords: ['china', 'beijing', 'xi jinping', 'chinese'],
        children: [
          { id: 'china_taiwan', label: 'Taiwan', level: 3, keywords: ['taiwan', 'taipei', 'strait', 'pla'] },
          { id: 'china_chip', label: 'Chip War', level: 3, keywords: ['semiconductor', 'nvidia', 'tsmc', 'chip ban', 'export control'] },
          { id: 'china_economy', label: 'Economia Cinese', level: 3, keywords: ['yuan', 'pboc', 'chinese economy', 'gdp china'] },
        ],
      },
      {
        id: 'geo_russia', label: 'Russia & Ucraina', level: 2,
        keywords: ['russia', 'ukraine', 'moscow', 'kyiv', 'putin', 'zelensky', 'kremlin'],
        children: [
          { id: 'russia_war', label: 'Guerra Ucraina', level: 3, keywords: ['war ukraine', 'frontline', 'kharkiv', 'donetsk', 'offensive'] },
          { id: 'russia_sanctions', label: 'Sanzioni Russia', level: 3, keywords: ['russia sanctions', 'swift', 'russian economy', 'rouble'] },
        ],
      },
      {
        id: 'geo_middleeast', label: 'Medio Oriente', level: 2,
        keywords: ['israel', 'gaza', 'iran', 'hamas', 'hezbollah', 'west bank', 'middle east'],
        children: [
          { id: 'me_israel_gaza', label: 'Israele-Gaza', level: 3, keywords: ['israel', 'gaza', 'idf', 'hamas', 'ceasefire', 'civilian'] },
          { id: 'me_iran', label: 'Iran', level: 3, keywords: ['iran', 'tehran', 'nuclear', 'khamenei', 'irgc'] },
          { id: 'me_yemen', label: 'Yemen & Houthi', level: 3, keywords: ['houthi', 'yemen', 'red sea', 'shipping attack'] },
        ],
      },
      {
        id: 'geo_europe', label: 'Europa', level: 2,
        keywords: ['europe', 'eu', 'nato', 'brussels', 'european union'],
        children: [
          { id: 'europe_politics', label: 'Politica UE', level: 3, keywords: ['european parliament', 'commission', 'von der leyen', 'eu council'] },
          { id: 'europe_nato', label: 'NATO', level: 3, keywords: ['nato', 'alliance', 'defense spending', 'article 5'] },
        ],
      },
      { id: 'geo_africa', label: 'Africa', level: 2, keywords: ['africa', 'sahel', 'sudan', 'ethiopia', 'nigeria', 'somalia', 'congo'] },
      { id: 'geo_asia_pacific', label: 'Asia-Pacifico', level: 2, keywords: ['japan', 'south korea', 'india', 'indonesia', 'asean', 'pacific'] },
    ],
  },
  {
    id: 'ai_tech', label: 'AI & Tecnologia', icon: '🤖', level: 1, type: 'static',
    keywords: ['artificial intelligence', 'technology', 'tech', 'software', 'digital'],
    children: [
      {
        id: 'ai_core', label: 'Intelligenza Artificiale', level: 2,
        keywords: ['llm', 'openai', 'claude', 'gemini', 'machine learning', 'neural', 'gpt'],
        children: [
          { id: 'ai_regulation', label: 'Regolamentazione AI', level: 3, keywords: ['eu ai act', 'ai law', 'ai governance', 'ai safety'] },
          { id: 'ai_models', label: 'Modelli & Ricerca', level: 3, keywords: ['gpt-5', 'llama', 'gemini', 'claude', 'model release', 'benchmark'] },
          { id: 'ai_robotics', label: 'Robotica & Automazione', level: 3, keywords: ['robot', 'automation', 'autonomous', 'humanoid'] },
        ],
      },
      {
        id: 'cybersecurity', label: 'Cybersecurity', level: 2,
        keywords: ['hack', 'ransomware', 'data breach', 'cyber attack', 'malware', 'vulnerability'],
        children: [
          { id: 'cyber_state', label: 'Attacchi Statali', level: 3, keywords: ['apt', 'nation-state', 'state sponsored', 'espionage cyber'] },
          { id: 'cyber_ransomware', label: 'Ransomware', level: 3, keywords: ['ransomware', 'lockbit', 'hospital attack', 'critical infrastructure'] },
        ],
      },
      {
        id: 'bigtech', label: 'Big Tech', level: 2,
        keywords: ['apple', 'google', 'meta', 'microsoft', 'amazon', 'nvidia', 'tesla'],
        children: [
          { id: 'bigtech_antitrust', label: 'Antitrust', level: 3, keywords: ['antitrust', 'monopoly', 'doj', 'ftc', 'competition'] },
          { id: 'bigtech_layoffs', label: 'Layoff & Restructuring', level: 3, keywords: ['layoff', 'job cut', 'restructuring', 'workforce reduction'] },
        ],
      },
      { id: 'space', label: 'Spazio', level: 2, keywords: ['nasa', 'spacex', 'rocket', 'satellite', 'moon', 'mars', 'launch'] },
    ],
  },
  {
    id: 'economy', label: 'Economia & Finanza', icon: '📈', level: 1, type: 'static',
    keywords: ['economy', 'finance', 'market', 'trade', 'gdp', 'inflation', 'bank'],
    children: [
      {
        id: 'markets', label: 'Mercati Finanziari', level: 2,
        keywords: ['stock market', 'wall street', 'nasdaq', 's&p', 'dow', 'index', 'equities'],
        children: [
          { id: 'market_crash', label: 'Volatilità & Crisi', level: 3, keywords: ['market crash', 'volatility', 'selloff', 'bear market', 'correction'] },
          { id: 'market_fed', label: 'Fed & Banche Centrali', level: 3, keywords: ['federal reserve', 'interest rate', 'ecb', 'rate hike', 'monetary policy'] },
        ],
      },
      {
        id: 'crypto', label: 'Criptovalute', level: 2,
        keywords: ['bitcoin', 'crypto', 'ethereum', 'blockchain', 'defi', 'nft', 'web3'],
        children: [
          { id: 'crypto_btc', label: 'Bitcoin', level: 3, keywords: ['bitcoin', 'btc', 'halving', 'satoshi', 'lightning network'] },
          { id: 'crypto_regulation', label: 'Regolamentazione Crypto', level: 3, keywords: ['crypto regulation', 'sec crypto', 'mica', 'stablecoin law'] },
        ],
      },
      { id: 'energy_economy', label: 'Energia', level: 2, keywords: ['oil', 'gas', 'opec', 'energy price', 'crude', 'lng', 'pipeline'] },
    ],
  },
  {
    id: 'health_science', label: 'Salute & Scienza', icon: '🔬', level: 1, type: 'static',
    keywords: ['health', 'science', 'research', 'medical', 'disease'],
    children: [
      { id: 'pandemic', label: 'Epidemie & Pandemia', level: 2, keywords: ['outbreak', 'epidemic', 'pandemic', 'who', 'vaccine', 'virus'] },
      { id: 'climate_science', label: 'Clima', level: 2, keywords: ['climate change', 'global warming', 'cop', 'carbon', 'emissions', 'fossil fuel'] },
      { id: 'space_science', label: 'Spazio & Fisica', level: 2, keywords: ['astronomy', 'physics', 'cern', 'quantum', 'discovery', 'exoplanet'] },
    ],
  },
  {
    id: 'narratives', label: '🎭 Narrative Intelligence', icon: '', level: 1, type: 'ai',
    keywords: [],
    children: [
      { id: 'narrative_west', label: '🌐 Occidentale', level: 2, keywords: ['reuters', 'ap news', 'bbc', 'guardian', 'new york times'] },
      { id: 'narrative_china', label: '🇨🇳 Narrativa Cinese', level: 2, keywords: ['xinhua', 'global times', 'cgtn', 'people daily', 'cctv'] },
      { id: 'narrative_russia', label: '🇷🇺 Narrativa Russa', level: 2, keywords: ['rt ', 'sputnik', 'tass', 'kremlin', 'lavrov'] },
      { id: 'narrative_indep', label: '⚡ Fonti Indipendenti', level: 2, keywords: ['bellingcat', 'intercept', 'propublica', 'investigative'] },
    ],
  },
  {
    id: 'osint', label: '🔍 OSINT & Intelligence', icon: '', level: 1, type: 'advanced',
    keywords: ['osint', 'intelligence', 'investigation', 'analysis'],
    children: [
      { id: 'military_analysis', label: 'Analisi Militare', level: 2, keywords: ['military', 'troops', 'defense', 'weapon', 'armament', 'frontline'] },
      { id: 'cyber_intel', label: 'Cyber Intelligence', level: 2, keywords: ['apt', 'threat actor', 'nation-state attack', 'zero-day', 'exploit'] },
      { id: 'sanctions_intel', label: 'Sanzioni & Geofin.', level: 2, keywords: ['sanctions', 'ofac', 'swift ban', 'financial intelligence'] },
    ],
  },
  {
    id: 'sport', label: '⚽ Sport', icon: '', level: 1, type: 'static',
    keywords: ['sport', 'football', 'soccer', 'tennis', 'basket', 'olympics', 'champions', 'serie a', 'premier league', 'la liga', 'bundesliga'],
    children: [
      { id: 'sport_calcio', label: 'Calcio', level: 2, keywords: ['football', 'soccer', 'serie a', 'champions league', 'premier league', 'la liga', 'fifa', 'uefa'] },
      { id: 'sport_tennis', label: 'Tennis', level: 2, keywords: ['tennis', 'atp', 'wta', 'wimbledon', 'roland garros', 'us open', 'australian open'] },
      { id: 'sport_basket', label: 'Basket', level: 2, keywords: ['nba', 'basketball', 'eurolega', 'lebron', 'playoff'] },
      { id: 'sport_motori', label: 'Motori', level: 2, keywords: ['formula 1', 'f1', 'motogp', 'ferrari', 'mercedes', 'red bull'] },
      { id: 'sport_olimpiadi', label: 'Olimpiadi', level: 2, keywords: ['olympics', 'olimpiadi', 'cio', 'medaglia', 'gold medal'] },
    ],
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
