export type GlobalStat = {
  id: string
  label: string
  value: string
  unit: string
  trend?: 'up' | 'down' | 'stable'
  category: string
  linkedCategory: string
  source: string
  curiosity: string
}

export const STAT_KEYWORDS: Record<string, string[]> = {
  economia:    ['econom', 'mercato', 'borsa', 'banca', 'inflazione', 'euro', 'dollaro', 'commercio', 'trade', 'market', 'finance', 'bank', 'pil', 'gdp', 'disoccup', 'lavoro', 'tariff', 'sanction', 'export', 'import', 'recession', 'inflation', 'invest', 'stock', 'crypto', 'bitcoin', 'debito', 'debt', 'deficit', 'budget', 'fmi', 'bce', 'fed', 'riserva', 'valuta', 'currency', 'tasso', 'interest rate', 'crescita', 'growth'],
  ambiente:    ['clima', 'ambient', 'co2', 'carbon', 'climate', 'forest', 'emissioni', 'verde', 'inquin', 'wildfire', 'flood', 'drought', 'renewable', 'emission', 'deforest', 'glacier', 'sea level', 'metano', 'methane', 'foresta', 'energia', 'energy', 'agricol', 'siccità', 'alluvion', 'incendio', 'riscaldamento', 'warming', 'cop', 'paris', 'kyoto', 'biodiversit', 'estinzione', 'ocean', 'arctic'],
  salute:      ['salute', 'sanità', 'covid', 'virus', 'ospedal', 'medic', 'health', 'hospital', 'vaccin', 'pandemia', 'malattia', 'death', 'mortality', 'injury', 'outbreak', 'drug', 'treatment', 'disease', 'cancer', 'mental health', 'fame', 'hunger', 'malnutrizione', 'acqua', 'water', 'infant', 'bambini', 'children', 'hiv', 'aids', 'tuberculosi', 'malaria', 'mortalità', 'speranza di vita', 'oms', 'who'],
  conflitti:   ['guerra', 'conflitto', 'militar', 'attacco', 'war', 'conflict', 'attack', 'missile', 'bomba', 'weapons', 'drone', 'troops', 'nato', 'occupied', 'shelling', 'ceasefire', 'airstrike', 'casualties', 'battle', 'invasion', 'armamenti', 'arms', 'difesa', 'defense', 'esercito', 'army', 'pace', 'peace', 'negoziato', 'negotiation', 'crimini di guerra', 'war crimes', 'terrorismo', 'terrorism'],
  tecnologia:  ['tech', 'tecnolog', 'artificial', 'software', 'internet', 'digital', 'cyber', 'ai ', 'robot', 'vulnerab', 'exploit', 'hack', 'security', 'breach', 'server', 'network', 'code', 'bug', 'patch', 'malware', 'ransomware', 'chip', 'semiconductor', 'data', 'algorithm', 'cloud', 'quantum', 'startup', 'silicon', 'innovazione', 'innovation', 'brevetto', 'patent', 'ricerca', 'research', 'sviluppo', 'development', 'intelligenza artificiale'],
  istruzione:  ['scuola', 'università', 'istruzione', 'education', 'school', 'university', 'student', 'studente', 'alfabetizzazione', 'literacy', 'formazione', 'training', 'laureati', 'graduate', 'insegnante', 'teacher', 'classifica', 'ranking', 'pisa', 'ocse', 'oecd'],
  migrazione:  ['migranti', 'rifugiati', 'migrazione', 'migration', 'refugee', 'asylum', 'asilo', 'confine', 'border', 'sbarco', 'immigrazione', 'emigrazione', 'diaspora', 'displacement', 'profughi', 'clandestini', 'flussi migratori', 'unhcr'],
  governance:  ['governo', 'democrazia', 'elezioni', 'government', 'election', 'democracy', 'corruzione', 'corruption', 'trasparenza', 'transparency', 'rule of law', 'stato di diritto', 'diritti umani', 'human rights', 'libertà', 'freedom', 'press freedom', 'libertà di stampa', 'parlamento', 'parliament', 'costituzione'],
  cultura:     ['cultura', 'arte', 'musica', 'film', 'book', 'language', 'lingua', 'award', 'festival', 'cinema', 'literature', 'theater', 'museum', 'patrimonio', 'heritage', 'tradizione', 'religion', 'religione'],
  politica:    ['election', 'government', 'president', 'minister', 'parliament', 'senate', 'vote', 'policy', 'political', 'diplomat', 'summit', 'treaty', 'sanction', 'referendum', 'partito', 'party', 'coalizione', 'opposition', 'opposizione', 'voto', 'campagna'],
  urbanizzazione: ['città', 'urbano', 'urban', 'metropoli', 'megalopoli', 'periferia', 'suburb', 'infrastruttura', 'infrastructure', 'trasporti', 'transport', 'smart city', 'housing', 'abitazioni', 'costruzioni'],
}

export function getRelevantStats(query: string, stats: GlobalStat[], max = 5): GlobalStat[] {
  const q = query.toLowerCase()
  const scored = stats
    .map((stat) => {
      let score = 0
      for (const kw of STAT_KEYWORDS[stat.category] ?? [])       if (q.includes(kw)) score += 2
      for (const kw of STAT_KEYWORDS[stat.linkedCategory] ?? []) if (q.includes(kw)) score += 1
      if (stat.category === q || stat.linkedCategory === q) score += 5
      return { stat, score }
    })
    .sort((a, b) => b.score - a.score)

  // Take top scorers but ensure category diversity (max 2 per category)
  const result: GlobalStat[] = []
  const catCount: Record<string, number> = {}
  for (const { stat } of scored) {
    const c = stat.category
    if ((catCount[c] ?? 0) >= 2) continue
    catCount[c] = (catCount[c] ?? 0) + 1
    result.push(stat)
    if (result.length >= max) break
  }
  return result
}

const WB = 'https://api.worldbank.org/v2'

async function wb(indicator: string): Promise<number | null> {
  try {
    const r = await fetch(
      `${WB}/country/WLD/indicator/${indicator}?format=json&mrv=1&per_page=1`,
      { next: { revalidate: 604800 } }
    )
    const data = await r.json()
    return data[1]?.[0]?.value ?? null
  } catch { return null }
}

function fmt(n: number, decimals = 1): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(decimals)} tril.`
  if (n >= 1e9)  return `${(n / 1e9).toFixed(decimals)} mld`
  if (n >= 1e6)  return `${(n / 1e6).toFixed(decimals)} mln`
  return n.toLocaleString('it-IT', { maximumFractionDigits: decimals })
}

export async function fetchGlobalStats(): Promise<GlobalStat[]> {
  const [
    gdp, pop, unemp, inflation, gdpPerCapita, trade, fdi,
    co2, forest, renewable, methane, agriLand, electricity,
    lifeExp, childMort, healthSpend, malnutrition, water, hospitalBeds,
    militarySpend, militaryPersonnel, homicides,
    internet, rnd, patents,
    literacy, educationSpend, urbanPop,
  ] = await Promise.allSettled([
    // ECONOMIA
    wb('NY.GDP.MKTP.CD'),        // PIL mondiale
    wb('SP.POP.TOTL'),           // Popolazione
    wb('SL.UEM.TOTL.ZS'),        // Disoccupazione %
    wb('FP.CPI.TOTL.ZG'),        // Inflazione %
    wb('NY.GDP.PCAP.CD'),        // PIL pro capite
    wb('NE.TRD.GNFS.ZS'),        // Commercio % PIL
    wb('BX.KLT.DINV.CD.WD'),     // Investimenti diretti esteri netti
    // AMBIENTE
    wb('EN.ATM.CO2E.KT'),        // Emissioni CO₂
    wb('AG.LND.FRST.ZS'),        // Superficie forestale %
    wb('EG.FEC.RNEW.ZS'),        // Energia rinnovabile %
    wb('EN.ATM.METH.KT.CE'),     // Emissioni metano
    wb('AG.LND.AGRI.ZS'),        // Superficie agricola %
    wb('EG.ELC.ACCS.ZS'),        // Accesso all'elettricità %
    // SALUTE
    wb('SP.DYN.LE00.IN'),        // Aspettativa di vita
    wb('SH.DYN.MORT'),           // Mortalità infantile under-5
    wb('SH.XPD.CHEX.GD.ZS'),    // Spesa sanitaria % PIL
    wb('SN.ITK.DEFC.ZS'),        // Malnutrizione %
    wb('SH.H2O.BASW.ZS'),        // Accesso acqua potabile %
    wb('SH.MED.BEDS.ZS'),        // Posti letto ospedalieri per 1000
    // CONFLITTI
    wb('MS.MIL.XPND.GD.ZS'),    // Spesa militare % PIL
    wb('MS.MIL.TOTL.P1'),        // Personale militare totale
    wb('VC.IHR.PSRC.P5'),        // Omicidi per 100k
    // TECNOLOGIA
    wb('IT.NET.USER.ZS'),        // Utenti internet %
    wb('GB.XPD.RSDV.GD.ZS'),    // Spesa R&D % PIL
    wb('IP.PAT.RESD'),           // Brevetti depositati
    // ISTRUZIONE / GOVERNANCE
    wb('SE.ADT.LITR.ZS'),        // Alfabetizzazione adulti %
    wb('SE.XPD.TOTL.GD.ZS'),     // Spesa istruzione % PIL
    wb('SP.URB.TOTL.IN.ZS'),     // Popolazione urbana %
  ])

  const g = (r: PromiseSettledResult<number | null>) =>
    r.status === 'fulfilled' ? r.value : null

  const stats: GlobalStat[] = []

  // ── ECONOMIA ──────────────────────────────────────────────
  if (g(gdp)) stats.push({
    id: 'gdp', label: 'PIL Mondiale', value: fmt(g(gdp)!),
    unit: 'USD', trend: 'up', category: 'economia', linkedCategory: 'economia',
    source: 'World Bank 2023',
    curiosity: 'Il PIL mondiale è cresciuto di oltre 10× negli ultimi 50 anni',
  })
  if (g(pop)) stats.push({
    id: 'pop', label: 'Popolazione mondiale', value: fmt(g(pop)!),
    unit: 'persone', trend: 'up', category: 'salute', linkedCategory: 'migrazione',
    source: 'World Bank 2023',
    curiosity: 'Ogni giorno nascono circa 385.000 persone nel mondo',
  })
  if (g(unemp)) stats.push({
    id: 'unemp', label: 'Disoccupazione globale', value: `${g(unemp)!.toFixed(1)}`,
    unit: '%', trend: 'stable', category: 'economia', linkedCategory: 'economia',
    source: 'World Bank 2023',
    curiosity: 'Circa 190 milioni di persone cercano attivamente lavoro nel mondo',
  })
  if (g(inflation)) stats.push({
    id: 'inflation', label: 'Inflazione media mondiale', value: `${g(inflation)!.toFixed(1)}`,
    unit: '%', trend: 'down', category: 'economia', linkedCategory: 'economia',
    source: 'World Bank 2023',
    curiosity: "Nel 2022 l'inflazione globale ha toccato il 9% — il picco degli ultimi 40 anni",
  })
  if (g(gdpPerCapita)) stats.push({
    id: 'gdppc', label: 'PIL pro capite mondiale', value: fmt(g(gdpPerCapita)!),
    unit: 'USD/persona', trend: 'up', category: 'economia', linkedCategory: 'governance',
    source: 'World Bank 2023',
    curiosity: 'Il PIL pro capite varia da 500$ (paesi più poveri) a 120.000$ (Lussemburgo)',
  })
  if (g(trade)) stats.push({
    id: 'trade', label: 'Commercio mondiale', value: `${g(trade)!.toFixed(1)}`,
    unit: '% del PIL', trend: 'stable', category: 'economia', linkedCategory: 'politica',
    source: 'World Bank 2023',
    curiosity: "Il commercio globale vale oltre 32 trilioni di dollari l'anno",
  })
  if (g(fdi)) stats.push({
    id: 'fdi', label: 'Investimenti esteri netti', value: fmt(g(fdi)!),
    unit: 'USD', trend: 'stable', category: 'economia', linkedCategory: 'economia',
    source: 'World Bank 2023',
    curiosity: 'Gli IDE sono il principale motore di sviluppo per i paesi emergenti',
  })

  // ── AMBIENTE ──────────────────────────────────────────────
  if (g(co2)) stats.push({
    id: 'co2', label: 'Emissioni CO₂ annue', value: fmt(g(co2)! * 1000),
    unit: 'tonnellate', trend: 'up', category: 'ambiente', linkedCategory: 'ambiente',
    source: 'World Bank 2022',
    curiosity: "L'Artico si riscalda 4× più veloce del resto del pianeta",
  })
  if (g(forest)) stats.push({
    id: 'forest', label: 'Superficie forestale mondiale', value: `${g(forest)!.toFixed(1)}`,
    unit: '% superficie terrestre', trend: 'down', category: 'ambiente', linkedCategory: 'ambiente',
    source: 'World Bank 2022',
    curiosity: 'Nel 1990 le foreste coprivano il 31.8% della terra. Oggi meno del 31%',
  })
  if (g(renewable)) stats.push({
    id: 'renew', label: 'Energia rinnovabile', value: `${g(renewable)!.toFixed(1)}`,
    unit: '% del totale', trend: 'up', category: 'ambiente', linkedCategory: 'tecnologia',
    source: 'World Bank 2022',
    curiosity: 'Il solare è la fonte energetica con i costi calati più rapidamente nella storia',
  })
  if (g(methane)) stats.push({
    id: 'methane', label: 'Emissioni di metano', value: fmt(g(methane)! * 1000),
    unit: 'tonnellate CO₂ eq.', trend: 'up', category: 'ambiente', linkedCategory: 'ambiente',
    source: 'World Bank 2022',
    curiosity: 'Il metano ha un potere climalterante 80× superiore alla CO₂ a 20 anni',
  })
  if (g(agriLand)) stats.push({
    id: 'agri', label: 'Superficie agricola mondiale', value: `${g(agriLand)!.toFixed(1)}`,
    unit: '% superficie terrestre', trend: 'stable', category: 'ambiente', linkedCategory: 'salute',
    source: 'World Bank 2021',
    curiosity: "L'agricoltura usa il 70% dell'acqua dolce disponibile nel mondo",
  })
  if (g(electricity)) stats.push({
    id: 'elec', label: "Accesso all'elettricità", value: `${g(electricity)!.toFixed(1)}`,
    unit: '% popolazione', trend: 'up', category: 'governance', linkedCategory: 'ambiente',
    source: 'World Bank 2022',
    curiosity: "Nel 2000 solo il 78% della popolazione mondiale aveva accesso all'elettricità",
  })

  // ── SALUTE ──────────────────────────────────────────────
  if (g(lifeExp)) stats.push({
    id: 'life', label: 'Aspettativa di vita media', value: `${g(lifeExp)!.toFixed(1)}`,
    unit: 'anni', trend: 'up', category: 'salute', linkedCategory: 'salute',
    source: 'World Bank 2022',
    curiosity: 'Nel 1900 era 32 anni. Oggi è più del doppio grazie a vaccini e igiene',
  })
  if (g(childMort)) stats.push({
    id: 'childmort', label: 'Mortalità infantile under-5', value: `${g(childMort)!.toFixed(1)}`,
    unit: 'per 1.000 nati', trend: 'down', category: 'salute', linkedCategory: 'salute',
    source: 'World Bank 2022',
    curiosity: 'Nel 1990 morivano 93 bambini su 1.000 prima dei 5 anni. Oggi meno di 40',
  })
  if (g(healthSpend)) stats.push({
    id: 'health', label: 'Spesa sanitaria mondiale', value: `${g(healthSpend)!.toFixed(1)}`,
    unit: '% del PIL', trend: 'up', category: 'salute', linkedCategory: 'economia',
    source: 'World Bank 2021',
    curiosity: 'Gli USA spendono il 17% del PIL in sanità — più del doppio della media europea',
  })
  if (g(malnutrition)) stats.push({
    id: 'malnutr', label: 'Malnutrizione nel mondo', value: `${g(malnutrition)!.toFixed(1)}`,
    unit: '% popolazione', trend: 'up', category: 'salute', linkedCategory: 'ambiente',
    source: 'World Bank / FAO 2022',
    curiosity: 'Il cibo sprecato ogni anno potrebbe nutrire 2 miliardi di persone',
  })
  if (g(water)) stats.push({
    id: 'water', label: 'Accesso ad acqua potabile', value: `${g(water)!.toFixed(1)}`,
    unit: '% popolazione', trend: 'up', category: 'salute', linkedCategory: 'ambiente',
    source: 'World Bank 2022',
    curiosity: '2 miliardi di persone non hanno accesso a servizi idrici sicuri',
  })
  if (g(hospitalBeds)) stats.push({
    id: 'beds', label: 'Posti letto ospedalieri', value: `${g(hospitalBeds)!.toFixed(1)}`,
    unit: 'per 1.000 abitanti', trend: 'stable', category: 'salute', linkedCategory: 'governance',
    source: 'World Bank 2020',
    curiosity: 'Durante il COVID-19 molti paesi hanno scoperto di avere meno di 3 posti letto ogni 1.000 abitanti',
  })

  // ── CONFLITTI ──────────────────────────────────────────────
  if (g(militarySpend)) stats.push({
    id: 'milspend', label: 'Spesa militare mondiale', value: `${g(militarySpend)!.toFixed(1)}`,
    unit: '% del PIL', trend: 'up', category: 'conflitti', linkedCategory: 'economia',
    source: 'World Bank / SIPRI 2022',
    curiosity: 'Nel 2023 la spesa militare globale ha superato 2.400 miliardi di dollari — record storico',
  })
  if (g(militaryPersonnel)) stats.push({
    id: 'milpers', label: 'Personale militare attivo', value: fmt(g(militaryPersonnel)!),
    unit: 'soldati', trend: 'stable', category: 'conflitti', linkedCategory: 'conflitti',
    source: 'World Bank 2022',
    curiosity: "La Cina ha l'esercito più numeroso al mondo con oltre 2 milioni di soldati attivi",
  })
  if (g(homicides)) stats.push({
    id: 'homicide', label: 'Tasso di omicidi mondiale', value: `${g(homicides)!.toFixed(1)}`,
    unit: 'per 100.000 persone', trend: 'down', category: 'conflitti', linkedCategory: 'governance',
    source: 'World Bank / UNODC 2021',
    curiosity: 'Il tasso globale di omicidi è diminuito del 20% negli ultimi 20 anni',
  })

  // ── TECNOLOGIA ──────────────────────────────────────────────
  if (g(internet)) stats.push({
    id: 'internet', label: 'Utenti Internet', value: `${g(internet)!.toFixed(1)}`,
    unit: '% popolazione', trend: 'up', category: 'tecnologia', linkedCategory: 'tecnologia',
    source: 'World Bank / ITU 2022',
    curiosity: "Nel 2000 solo l'1% della popolazione mondiale era online. Oggi è il 66%",
  })
  if (g(rnd)) stats.push({
    id: 'rnd', label: 'Spesa in R&D mondiale', value: `${g(rnd)!.toFixed(2)}`,
    unit: '% del PIL', trend: 'up', category: 'tecnologia', linkedCategory: 'economia',
    source: 'World Bank 2021',
    curiosity: 'Israele spende il 6% del PIL in ricerca e sviluppo — il più alto al mondo',
  })
  if (g(patents)) stats.push({
    id: 'patents', label: 'Brevetti depositati/anno', value: fmt(g(patents)!),
    unit: 'applicazioni', trend: 'up', category: 'tecnologia', linkedCategory: 'economia',
    source: 'World Bank / WIPO 2021',
    curiosity: 'La Cina deposita più brevetti di USA, Europa e Giappone messi insieme',
  })

  // ── ISTRUZIONE / GOVERNANCE ──────────────────────────────────────────────
  if (g(literacy)) stats.push({
    id: 'literacy', label: 'Alfabetizzazione adulti', value: `${g(literacy)!.toFixed(1)}`,
    unit: '% popolazione +15 anni', trend: 'up', category: 'istruzione', linkedCategory: 'governance',
    source: 'World Bank / UNESCO 2022',
    curiosity: '771 milioni di adulti nel mondo non sanno ancora leggere né scrivere',
  })
  if (g(educationSpend)) stats.push({
    id: 'edu', label: 'Spesa pubblica in istruzione', value: `${g(educationSpend)!.toFixed(1)}`,
    unit: '% del PIL', trend: 'stable', category: 'istruzione', linkedCategory: 'economia',
    source: 'World Bank 2021',
    curiosity: 'I paesi con maggiore spesa in istruzione hanno mediamente GDP pro capite 3× superiore',
  })
  if (g(urbanPop)) stats.push({
    id: 'urban', label: 'Popolazione urbana mondiale', value: `${g(urbanPop)!.toFixed(1)}`,
    unit: '% del totale', trend: 'up', category: 'urbanizzazione', linkedCategory: 'migrazione',
    source: 'World Bank 2023',
    curiosity: 'Nel 1950 solo il 30% della popolazione viveva in città. Nel 2050 sarà il 68%',
  })

  // ── STATICHE — sempre rilevanti ──────────────────────────────────────────────
  stats.push(
    {
      id: 'hunger', label: 'Persone in stato di fame', value: '733 milioni',
      unit: 'persone', trend: 'up', category: 'salute', linkedCategory: 'ambiente',
      source: 'FAO 2024',
      curiosity: 'Il cibo sprecato ogni anno potrebbe nutrire 2 miliardi di persone',
    },
    {
      id: 'forests_loss', label: 'Perdita foreste/anno', value: '10 milioni',
      unit: 'ettari', trend: 'down', category: 'ambiente', linkedCategory: 'ambiente',
      source: 'FAO 2023',
      curiosity: 'Equivale a perdere un campo da calcio ogni secondo',
    },
    {
      id: 'refugees', label: 'Rifugiati nel mondo', value: '117 milioni',
      unit: 'persone', trend: 'up', category: 'migrazione', linkedCategory: 'conflitti',
      source: 'UNHCR 2024',
      curiosity: 'È il numero più alto mai registrato: 1 persona su 69 nel mondo è sfollata',
    },
    {
      id: 'languages', label: 'Lingue parlate nel mondo', value: '7.168',
      unit: 'lingue', trend: 'down', category: 'cultura', linkedCategory: 'cultura',
      source: 'Ethnologue 2024',
      curiosity: 'Una lingua muore ogni 2 settimane. Il 40% è a rischio estinzione',
    },
    {
      id: 'press_freedom', label: 'Paesi con stampa libera', value: '8',
      unit: 'su 180 monitorati', trend: 'down', category: 'governance', linkedCategory: 'politica',
      source: 'RSF Press Freedom Index 2024',
      curiosity: 'Solo il 4% della popolazione mondiale vive in paesi con piena libertà di stampa',
    },
    {
      id: 'child_labor', label: 'Bambini in lavoro minorile', value: '160 milioni',
      unit: 'bambini', trend: 'stable', category: 'istruzione', linkedCategory: 'salute',
      source: 'ILO / UNICEF 2023',
      curiosity: "Il 70% dei bambini lavoratori si trova nell'agricoltura africana e asiatica",
    },
  )

  return stats
}
