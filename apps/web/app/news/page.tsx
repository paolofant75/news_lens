import { fetchArticles, timeAgo, biasColor } from '../../lib/rss'
import { encodeArticleId } from '../../lib/encode'
import { translateBatch } from '../../lib/translate'
import { cookies } from 'next/headers'
import PageLayout from '../../components/page-layout'
import { TAXONOMY } from '../../lib/taxonomy'

const CATEGORIES = [
  { label: 'Tutte', slug: '', icon: '' },
  { label: 'Ultime notizie', slug: 'breaking', icon: '🔴' },
  { label: 'Conflitti', slug: 'conflitti', icon: '⚔️' },
  { label: 'Politica', slug: 'politica', icon: '🏛️' },
  { label: 'Economia', slug: 'economia', icon: '📈' },
  { label: 'Tecnologia', slug: 'tecnologia', icon: '🤖' },
  { label: 'Scienza', slug: 'scienza', icon: '🔬' },
  { label: 'Salute', slug: 'salute', icon: '🏥' },
  { label: 'Ambiente', slug: 'ambiente', icon: '🌿' },
  { label: 'Sport', slug: 'sport', icon: '⚽' },
  { label: 'Cultura', slug: 'cultura', icon: '🎭' },
  { label: 'Cronaca', slug: 'cronaca', icon: '📰' },
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

const GEO = [
  { label: 'Tutto il mondo', slug: '', icon: '🌐' },
  { label: 'Europa', slug: 'europa', icon: '🇪🇺' },
  { label: 'Americhe', slug: 'americhe', icon: '🌎' },
  { label: 'Medio Oriente', slug: 'medio-oriente', icon: '🕌' },
  { label: 'Asia', slug: 'asia', icon: '🌏' },
  { label: 'Africa', slug: 'africa', icon: '🌍' },
  { label: 'Oceania', slug: 'oceania', icon: '🌊' },
]

export const revalidate = 300

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; area?: string; sport?: string; taxonomy?: string }>
}) {
  const { categoria, area, sport, taxonomy } = await searchParams
  const cookieStore = await cookies()
  const lang = cookieStore.get('nlv_lang')?.value ?? 'it'

  const allArticles = await fetchArticles()

  const sportKws = sport ? (SPORT_KEYWORDS[sport] ?? []) : []

  // Trova keywords del nodo tassonomia attivo
  function findTaxNode(id: string, nodes = TAXONOMY): string[] {
    for (const n of nodes) {
      if (n.id === id) return n.keywords
      if (n.children) {
        const found = findTaxNode(id, n.children)
        if (found.length) return found
      }
    }
    return []
  }
  const taxKws = taxonomy ? findTaxNode(taxonomy) : []

  const filtered = allArticles.filter((a) => {
    const catOk = !categoria || a.category === categoria
    const geoOk = !area || a.geo === area
    const sportOk = !sport || sportKws.some((kw) =>
      (a.title + ' ' + a.summary).toLowerCase().includes(kw)
    )
    const taxOk = taxKws.length === 0 || taxKws.some((kw) =>
      (a.title + ' ' + a.summary + ' ' + a.source).toLowerCase().includes(kw.toLowerCase())
    )
    return catOk && geoOk && sportOk && taxOk
  })

  // Traduci i titoli/summary nella lingua selezionata (max 50, con cache Redis)
  const translated = await translateBatch(
    filtered.slice(0, 50).map((a) => ({ title: a.title, summary: a.summary })),
    lang
  )
  // originalTitle = titolo EN per la ricerca Veritas, displayTitle = titolo tradotto per l'utente
  const filteredT = filtered.slice(0, 50).map((a, i) => ({
    ...a,
    originalTitle: a.title,
    title: translated[i]?.title ?? a.title,
    summary: translated[i]?.summary ?? a.summary,
  }))

  // Conteggio per area geografica
  const geoCounts = GEO.reduce((acc, g) => {
    acc[g.slug] = g.slug === '' ? allArticles.length : allArticles.filter((a) => a.geo === g.slug).length
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
      <div className="max-w-5xl mx-auto px-4 py-4">

        {/* GEO IN ALTO */}
        <div className="overflow-x-auto pb-3 mb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex gap-1.5 min-w-max items-center">
            <span className="text-xs font-semibold uppercase tracking-widest mr-2 shrink-0" style={{ color: 'var(--text-3)' }}>Area:</span>
            {GEO.map((g) => (
              <a key={g.slug} href={buildUrl(categoria, g.slug)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-opacity hover:opacity-80"
                style={g.slug === (area ?? '')
                  ? { background: 'var(--accent)', color: '#fff' }
                  : { background: 'var(--bg-card)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
              >
                <span>{g.icon}</span>
                <span>{g.label}</span>
                <span className="text-xs opacity-70">{geoCounts[g.slug]}</span>
              </a>
            ))}
            <a href="/mappa" className="px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-opacity hover:opacity-80 ml-2"
              style={{ color: 'var(--accent)', border: '1px solid var(--border)' }}>
              🗺️ Mappa
            </a>
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
        <div className="flex-1 min-w-0">
            <p className="text-sm mb-5" style={{ color: 'var(--text-3)' }}>
              {filtered.length} articoli · {new Set(filtered.map((a) => a.source)).size} fonti
            </p>
            {filtered.length === 0 ? (
              <div className="text-center py-20" style={{ color: 'var(--text-3)' }}>Nessun articolo trovato.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredT.map((article, i) => {
                  const analysisId = encodeArticleId(article.originalTitle ?? article.title)
                  return (
                    <div key={i} className="group rounded-xl overflow-hidden transition-all hover:opacity-90"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                      <a href={`/articolo/${analysisId}`} className="block p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>{article.source}</span>
                          <span className="text-xs" style={{ color: 'var(--text-3)' }}>{timeAgo(article.pubDate)}</span>
                        </div>
                        <h2 className="font-semibold mb-2 leading-snug line-clamp-3" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
                          {article.title}
                        </h2>
                        {article.summary && (
                          <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--text-2)' }}>{article.summary}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-s)', color: 'var(--text-3)' }}>{article.category}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-s)', color: 'var(--text-3)' }}>{article.geo}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${biasColor(article.sourceBias)}`} style={{ background: 'var(--bg-s)' }}>{article.sourceBias}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-s)', color: 'var(--text-3)' }}>★ {article.sourceReliability}</span>
                        </div>
                      </a>
                      <div className="px-5 pb-4 flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                        <a href={`/articolo/${analysisId}`} className="text-xs transition-opacity hover:opacity-70" style={{ color: 'var(--accent)' }}>
                          ⚖️ Analisi Veritas
                        </a>
                        <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-xs transition-opacity hover:opacity-70" style={{ color: 'var(--text-3)' }}>
                          Originale ↗
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
      </div>
    </PageLayout>
  )
}
