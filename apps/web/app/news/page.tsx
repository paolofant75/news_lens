import { fetchArticles, timeAgo, biasColor } from '../../lib/rss'
import { translateBatch } from '../../lib/translate'
import { sortByPreferredLang } from '../../lib/lang-priority'
import { boostByCountry } from '../../lib/country-priority'
import { applyWorldFilter } from '../../lib/world-filter'
import { cookies } from 'next/headers'
import PageLayout from '../../components/page-layout'
import UnregisteredCountryBannerWrapper from '../../components/unregistered-country-banner-wrapper'
import { TAXONOMY, getAllKeywords } from '../../lib/taxonomy'
import NewsArticleGrid from '../../components/news-article-grid'
import { IconGlobe, IconMap, IconMapPin, IconMosque, IconWaves, IconCompass, IconLeaf, IconGlobe2, IconLandmark } from '../../components/icons'

const CATEGORIES = [
  { label: 'Tutte', slug: '' },
  { label: 'Ultime notizie', slug: 'breaking' },
  { label: 'Esteri', slug: 'esteri' },
  { label: 'Cronaca', slug: 'cronaca' },
  { label: 'Politica', slug: 'politica' },
  { label: 'Economia', slug: 'economia' },
  { label: 'Sport', slug: 'sport' },
  { label: 'Tecnologia', slug: 'tecnologia' },
  { label: 'Conflitti', slug: 'conflitti' },
  { label: 'Scienza', slug: 'scienza' },
  { label: 'Salute', slug: 'salute' },
  { label: 'Ambiente', slug: 'ambiente' },
  { label: 'Cultura', slug: 'cultura' },
]

const SPORTS = [
  { label: 'Tutti gli sport', slug: '' },
  // Olimpici estivi
  { label: 'Atletica', slug: 'athletics' }, { label: 'Nuoto', slug: 'swimming' },
  { label: 'Calcio', slug: 'football' }, { label: 'Basket', slug: 'basketball' },
  { label: 'Tennis', slug: 'tennis' }, { label: 'Ciclismo', slug: 'cycling' },
  { label: 'Ginnastica', slug: 'gymnastics' }, { label: 'Boxe', slug: 'boxing' },
  { label: 'Judo', slug: 'judo' }, { label: 'Pallavolo', slug: 'volleyball' },
  { label: 'Rugby', slug: 'rugby' }, { label: 'Golf', slug: 'golf' },
  { label: 'Tiro con l\'arco', slug: 'archery' }, { label: 'Scherma', slug: 'fencing' },
  { label: 'Canoa', slug: 'canoe' }, { label: 'Vela', slug: 'sailing' },
  { label: 'Equitazione', slug: 'equestrian' }, { label: 'Sollevamento', slug: 'weightlifting' },
  { label: 'Lotta', slug: 'wrestling' }, { label: 'Taekwondo', slug: 'taekwondo' },
  { label: 'Badminton', slug: 'badminton' }, { label: 'Ping Pong', slug: 'table-tennis' },
  { label: 'Tiro a segno', slug: 'shooting' }, { label: 'Triathlon', slug: 'triathlon' },
  { label: 'Baseball', slug: 'baseball' }, { label: 'Skateboard', slug: 'skateboard' },
  { label: 'Surf', slug: 'surfing' },
  // Olimpici invernali
  { label: 'Sci alpino', slug: 'skiing' }, { label: 'Biathlon', slug: 'biathlon' },
  { label: 'Hockey ghiaccio', slug: 'ice-hockey' }, { label: 'Pattinaggio', slug: 'skating' },
  { label: 'Snowboard', slug: 'snowboard' },
  // Altri
  { label: 'Formula 1', slug: 'f1' }, { label: 'MotoGP', slug: 'motogp' },
  { label: 'Cricket', slug: 'cricket' }, { label: 'NFL', slug: 'nfl' },
  { label: 'MMA/UFC', slug: 'mma' },
]

const SPORT_KEYWORDS: Record<string, string[]> = {
  athletics: ['athletics', 'sprinter', 'marathon', 'track and field', 'atletica'],
  swimming: ['swimming', 'swimmer', 'nuoto', 'freestyle', 'backstroke'],
  football: ['football', 'soccer', 'premier league', 'serie a', 'champions league', 'fifa', 'calcio'],
  basketball: ['basketball', 'nba', 'basket'],
  tennis: ['tennis', 'wimbledon', 'grand slam', 'atp', 'wta'],
  cycling: ['cycling', 'tour de france', 'ciclismo', 'velodrome'],
  gymnastics: ['gymnastics', 'ginnastica', 'gymnast'],
  boxing: ['boxing', 'boxer', 'pugilato', 'bout'],
  judo: ['judo'],
  volleyball: ['volleyball', 'pallavolo'],
  rugby: ['rugby'],
  golf: ['golf', 'pga', 'masters'],
  archery: ['archery', 'archer'],
  fencing: ['fencing', 'scherma'],
  canoe: ['canoe', 'kayak', 'canoa'],
  sailing: ['sailing', 'vela', 'yacht'],
  equestrian: ['equestrian', 'horse', 'dressage', 'show jumping'],
  weightlifting: ['weightlifting', 'sollevamento pesi'],
  wrestling: ['wrestling', 'lotta'],
  taekwondo: ['taekwondo'],
  badminton: ['badminton'],
  'table-tennis': ['table tennis', 'ping pong'],
  shooting: ['shooting sport', 'tiro a segno', 'tiro a volo'],
  triathlon: ['triathlon'],
  baseball: ['baseball', 'mlb'],
  skateboard: ['skateboarding', 'skateboard'],
  surfing: ['surfing', 'surf'],
  skiing: ['skiing', 'slalom', 'ski', 'downhill'],
  biathlon: ['biathlon'],
  'ice-hockey': ['ice hockey', 'nhl', 'hockey su ghiaccio'],
  skating: ['figure skating', 'speed skating', 'pattinaggio'],
  snowboard: ['snowboard'],
  f1: ['formula 1', 'formula one', 'f1', 'grand prix', 'ferrari', 'red bull racing'],
  motogp: ['motogp', 'moto gp', 'rossi'],
  cricket: ['cricket'],
  nfl: ['nfl', 'american football', 'super bowl'],
  mma: ['mma', 'ufc', 'mixed martial arts'],
}

type IconComp = (p: { size?: number; className?: string }) => React.ReactElement
const GEO: { label: string; slug: string; Icon: IconComp | null }[] = [
  { label: 'Tutte',          slug: '',             Icon: null },
  { label: 'Mondo',          slug: 'mondo',        Icon: IconGlobe },  // terminale geopolitico: applica applyWorldFilter
  { label: 'Europa',         slug: 'europa',       Icon: IconLandmark },
  { label: 'Americhe',       slug: 'americhe',     Icon: IconCompass },
  { label: 'Medio Oriente',  slug: 'medio-oriente',Icon: IconMosque },
  { label: 'Asia',           slug: 'asia',         Icon: IconGlobe2 },
  { label: 'Africa',         slug: 'africa',       Icon: IconLeaf },
  { label: 'Oceania',        slug: 'oceania',      Icon: IconWaves },
]

export const revalidate = 120

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; area?: string; sport?: string; taxonomy?: string }>
}) {
  const { categoria, area, sport, taxonomy } = await searchParams
  const cookieStore = await cookies()
  const lang = cookieStore.get('nlv_lang')?.value ?? 'it'
  const country = cookieStore.get('nlv_country')?.value ?? 'IT'

  const allArticles = await fetchArticles()

  const sportKws = sport ? (SPORT_KEYWORDS[sport] ?? []) : []

  // Trova keywords del nodo tassonomia attivo (inclusi tutti i figli ricorsivamente)
  function findTaxNode(id: string, nodes = TAXONOMY): string[] {
    for (const n of nodes) {
      if (n.id === id) return getAllKeywords(n)
      if (n.children) {
        const found = findTaxNode(id, n.children)
        if (found.length) return found
      }
    }
    return []
  }
  const taxKws = taxonomy ? findTaxNode(taxonomy) : []

  // Quando l'utente seleziona area=mondo, applichiamo la policy editoriale del feed Mondo
  // (lib/world-filter.ts): zero ANSA regionali, zero La Presse Régional, nazionali italiane
  // solo se globalImpactScore >= 6 (G7/Vaticano/elezioni tier-1/crisi finanziaria), cap soft
  // 8 articoli/paese per evitare dominanza USA/UK.
  // applyWorldFilter e' async per supportare la classificazione AI (USE_AI_CLASSIFIER=true).
  const pool = area === 'mondo' ? await applyWorldFilter(allArticles, { capPerCountry: 8 }) : allArticles

  // Mappa slug URL (es. "politica") → nome interno categoria (es. "geopolitics").
  // Necessario dopo il revamp categorie (commit 6a913bb) che ha rinominato i valori interni.
  const CATEGORY_MAP: Record<string, string> = {
    cronaca:    'local_news',
    politica:   'geopolitics',
    economia:   'economy_finance',
    tecnologia: 'ai_tech',
    conflitti:  'geopolitics',
    scienza:    'health_science',
    salute:     'health_science',
    ambiente:   'health_science',
    cultura:    'culture',
    sport:      'sport',
    esteri:     'esteri',
    breaking:   'breaking',
  }
  const internalCat = categoria ? (CATEGORY_MAP[categoria] ?? categoria) : ''

  const filteredRaw = pool.filter((a) => {
    const catOk = !categoria || a.category === internalCat
    // Per area=mondo NON facciamo piu' il match letterale su a.geo: applyWorldFilter ha gia'
    // selezionato l'eligible set, e accettiamo articoli da qualunque continente (e' il senso del Mondo).
    const geoOk = !area || area === 'mondo' || a.geo === area
    const sportOk = !sport || sportKws.some((kw) =>
      (a.title + ' ' + a.summary).toLowerCase().includes(kw)
    )
    const taxOk = taxKws.length === 0 || taxKws.some((kw) =>
      (a.title + ' ' + a.summary + ' ' + a.source).toLowerCase().includes(kw.toLowerCase())
    )
    return catOk && geoOk && sportOk && taxOk
  })

  const filtered = sortByPreferredLang(filteredRaw, lang)
  const boosted = boostByCountry(filtered, country)

  // Traduci i titoli/summary nella lingua selezionata (max 50, con cache Redis)
  const translated = await translateBatch(
    boosted.slice(0, 50).map((a) => ({ title: a.title, summary: a.summary, source: a.source })),
    lang
  )
  // originalTitle = titolo EN per la ricerca Veritas, displayTitle = titolo tradotto per l'utente
  const filteredT = boosted.slice(0, 50).map((a, i) => ({
    ...a,
    originalTitle: a.title,
    title: translated[i]?.title ?? a.title,
    summary: translated[i]?.summary ?? a.summary,
  }))

  // Conteggio per area geografica. 'mondo' usa il pool world-filtered (la stessa policy
  // applicata alla visualizzazione), gli altri continenti contano sul pool originale.
  // Riusiamo `pool` quando area=mondo per non rifare la classificazione AI/cache lookup.
  const worldEligibleCount = area === 'mondo' ? pool.length : (await applyWorldFilter(allArticles, { capPerCountry: 8 })).length
  const geoCounts = GEO.reduce((acc, g) => {
    if (g.slug === '') acc[g.slug] = allArticles.length
    else if (g.slug === 'mondo') acc[g.slug] = worldEligibleCount
    else acc[g.slug] = allArticles.filter((a) => a.geo === g.slug).length
    return acc
  }, {} as Record<string, number>)

  function buildUrl(newCat?: string, newArea?: string, newSport?: string) {
    const params = new URLSearchParams()
    const c = newCat !== undefined ? newCat : (categoria ?? '')
    const g = newArea !== undefined ? newArea : (area ?? '')
    const s = newSport !== undefined ? newSport : (sport ?? '')
    if (c) params.set('categoria', c)
    if (g) params.set('area', g)
    if (s) params.set('sport', s)
    const q = params.toString()
    return q ? `/news?${q}` : '/news'
  }

  return (
    <PageLayout>
      <div className="flex min-h-screen">

        {/* GEO — colonna sinistra */}
        <aside
          className="hidden lg:flex flex-col w-36 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-4 px-2 gap-1"
          style={{ borderRight: '1px solid var(--border)', background: 'var(--bg-s)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-1 px-1" style={{ color: 'var(--text-3)' }}>Area</p>
          {GEO.map((g) => (
            <a
              key={g.slug}
              href={buildUrl(categoria, g.slug)}
              className="flex flex-col items-center gap-0.5 px-2 py-2.5 rounded-xl text-xs font-medium text-center transition-opacity hover:opacity-80"
              style={g.slug === (area ?? '')
                ? { background: 'var(--accent)', color: '#fff' }
                : { background: 'var(--bg-card)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
            >
              {g.Icon ? <g.Icon size={20} className="opacity-80" /> : <span className="text-xl leading-none">∞</span>}
              <span className="leading-tight mt-1">{g.label}</span>
              <span className="opacity-60 text-[10px]">{geoCounts[g.slug]}</span>
            </a>
          ))}
          <a
            href="/mappa"
            className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-xs text-center transition-opacity hover:opacity-80 mt-1"
            style={{ color: 'var(--accent)', border: '1px solid var(--border)', background: 'var(--bg-card)' }}
          >
            <IconMap size={14} />
            <span>Mappa</span>
          </a>
        </aside>

        {/* Contenuto principale */}
        <div className="flex-1 min-w-0 px-4 py-4">
          <UnregisteredCountryBannerWrapper />

          {/* GEO STRIP — solo mobile */}
          <div className="lg:hidden overflow-x-auto pb-2 mb-4 -mx-4 px-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex gap-2 min-w-max">
              {GEO.map((g) => (
                <a
                  key={g.slug}
                  href={buildUrl(categoria, g.slug)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-opacity hover:opacity-80"
                  style={g.slug === (area ?? '')
                    ? { background: 'var(--accent)', color: '#000' }
                    : { background: 'var(--bg-card)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                >
                  {g.Icon ? <g.Icon size={14} className="opacity-80" /> : <span>∞</span>}
                  <span>{g.label}</span>
                  <span className="opacity-50" style={{ fontSize: 10 }}>{geoCounts[g.slug]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Sottocategorie sport */}
          {categoria === 'sport' && (
            <div className="overflow-x-auto pb-2 mb-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex gap-1.5 min-w-max">
                {SPORTS.map((s) => (
                  <a key={s.slug} href={buildUrl(categoria, area, s.slug)}
                    className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-opacity hover:opacity-80"
                    style={s.slug === (sport ?? '')
                      ? { background: 'var(--accent)', color: '#fff' }
                      : { background: 'var(--bg-card)', color: 'var(--text-3)', border: '1px solid var(--border)' }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Articoli */}
          <NewsArticleGrid
            articles={filteredT}
            count={boosted.length}
            sourceCount={new Set(boosted.map((a) => a.source)).size}
          />
        </div>
      </div>
    </PageLayout>
  )
}
