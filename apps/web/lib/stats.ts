export type GlobalStat = {
  id: string
  label: string
  value: string
  unit: string
  trend?: 'up' | 'down' | 'stable'
  category: string
  linkedCategory: string   // categoria articoli correlati
  source: string
  curiosity: string        // fatto interessante correlato
}

const STAT_KEYWORDS: Record<string, string[]> = {
  economia:   ['econom', 'mercato', 'borsa', 'banca', 'inflazione', 'euro', 'dollaro', 'commercio', 'trade', 'market', 'finance', 'bank', 'pil', 'gdp', 'disoccup', 'lavoro'],
  ambiente:   ['clima', 'ambient', 'co2', 'carbon', 'climate', 'forest', 'emissioni', 'verde', 'inquin'],
  salute:     ['salute', 'sanità', 'covid', 'virus', 'ospedal', 'medic', 'health', 'hospital', 'vaccin', 'pandemia', 'malattia'],
  tecnologia: ['tech', 'tecnolog', 'artificial', 'software', 'internet', 'digital', 'cyber', 'ai ', 'robot'],
  conflitti:  ['guerra', 'conflitto', 'militar', 'attacco', 'war', 'conflict', 'attack', 'missile', 'bomba'],
  cultura:    ['cultura', 'arte', 'musica', 'film', 'book', 'language', 'lingua'],
}

export function getRelevantStats(query: string, stats: GlobalStat[], max = 3): GlobalStat[] {
  const q = query.toLowerCase()
  return stats
    .map((stat) => {
      let score = 0
      for (const kw of STAT_KEYWORDS[stat.category] ?? []) if (q.includes(kw)) score += 2
      for (const kw of STAT_KEYWORDS[stat.linkedCategory] ?? []) if (q.includes(kw)) score += 1
      // boost if category matches directly
      if (stat.category === q || stat.linkedCategory === q) score += 5
      return { stat, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => x.stat)
}

const WB = 'https://api.worldbank.org/v2'

async function fetchWorldBank(indicator: string): Promise<number | null> {
  try {
    const r = await fetch(
      `${WB}/country/WLD/indicator/${indicator}?format=json&mrv=1&per_page=1`,
      { next: { revalidate: 86400 } } // cache 24h
    )
    const data = await r.json()
    return data[1]?.[0]?.value ?? null
  } catch { return null }
}

function formatNumber(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)} trilioni`
  if (n >= 1e9)  return `${(n / 1e9).toFixed(1)} miliardi`
  if (n >= 1e6)  return `${(n / 1e6).toFixed(1)} milioni`
  return n.toLocaleString('it-IT', { maximumFractionDigits: 1 })
}

export async function fetchGlobalStats(): Promise<GlobalStat[]> {
  const [gdp, pop, co2, lifeExp, unemployment] = await Promise.allSettled([
    fetchWorldBank('NY.GDP.MKTP.CD'),
    fetchWorldBank('SP.POP.TOTL'),
    fetchWorldBank('EN.ATM.CO2E.KT'),
    fetchWorldBank('SP.DYN.LE00.IN'),
    fetchWorldBank('SL.UEM.TOTL.ZS'),
  ])

  const stats: GlobalStat[] = []

  const g = (r: PromiseSettledResult<number | null>) =>
    r.status === 'fulfilled' ? r.value : null

  if (g(gdp)) stats.push({
    id: 'gdp', label: 'PIL Mondiale', value: formatNumber(g(gdp)!),
    unit: 'USD', trend: 'up', category: 'economia',
    linkedCategory: 'economia', source: 'World Bank',
    curiosity: 'Il PIL mondiale è cresciuto di oltre 10× negli ultimi 50 anni',
  })

  if (g(pop)) stats.push({
    id: 'pop', label: 'Popolazione mondiale', value: formatNumber(g(pop)!),
    unit: 'persone', trend: 'up', category: 'scienza',
    linkedCategory: 'salute', source: 'World Bank',
    curiosity: 'Ogni giorno nascono circa 385.000 persone',
  })

  if (g(co2)) stats.push({
    id: 'co2', label: 'Emissioni CO₂ annue', value: formatNumber(g(co2)! * 1000),
    unit: 'tonnellate', trend: 'up', category: 'ambiente',
    linkedCategory: 'ambiente', source: 'World Bank',
    curiosity: 'L\'Artico si riscalda 4× più veloce del resto del pianeta',
  })

  if (g(lifeExp)) stats.push({
    id: 'life', label: 'Aspettativa di vita media', value: `${g(lifeExp)!.toFixed(1)}`,
    unit: 'anni', trend: 'up', category: 'salute',
    linkedCategory: 'salute', source: 'World Bank',
    curiosity: 'Nel 1900 era 32 anni. Oggi è più del doppio',
  })

  if (g(unemployment)) stats.push({
    id: 'unemp', label: 'Disoccupazione globale', value: `${g(unemployment)!.toFixed(1)}`,
    unit: '%', trend: 'stable', category: 'economia',
    linkedCategory: 'economia', source: 'World Bank',
    curiosity: 'Circa 190 milioni di persone cercano lavoro nel mondo',
  })

  // Statistiche statiche ma sorprendenti (sempre vere)
  stats.push(...STATIC_STATS)

  return stats.slice(0, 8)
}

const STATIC_STATS: GlobalStat[] = [
  {
    id: 'internet', label: 'Utenti Internet', value: '5.4 miliardi',
    unit: 'persone', trend: 'up', category: 'tecnologia',
    linkedCategory: 'tecnologia', source: 'ITU 2024',
    curiosity: '66% della popolazione mondiale è online. Nel 2000 era l\'1%',
  },
  {
    id: 'hunger', label: 'Persone in stato di fame', value: '733 milioni',
    unit: 'persone', trend: 'up', category: 'cronaca',
    linkedCategory: 'salute', source: 'FAO 2024',
    curiosity: 'Il cibo sprecato ogni anno potrebbe nutrire 2 miliardi di persone',
  },
  {
    id: 'forests', label: 'Perdita foreste/anno', value: '10 milioni',
    unit: 'ettari', trend: 'down', category: 'ambiente',
    linkedCategory: 'ambiente', source: 'FAO 2023',
    curiosity: 'Equivale a perdere un campo da calcio ogni secondo',
  },
  {
    id: 'languages', label: 'Lingue parlate nel mondo', value: '7.168',
    unit: 'lingue', trend: 'down', category: 'cultura',
    linkedCategory: 'cultura', source: 'Ethnologue 2024',
    curiosity: 'Una lingua muore ogni 2 settimane. Il 40% è a rischio estinzione',
  },
]
