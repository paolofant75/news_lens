import { fetchArticles, timeAgo } from '../../lib/rss'

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
  searchParams: Promise<{ categoria?: string; area?: string }>
}) {
  const { categoria, area } = await searchParams
  const allArticles = await fetchArticles()

  const filtered = allArticles.filter((a) => {
    const catOk = !categoria || a.category === categoria
    const geoOk = !area || a.geo === area
    return catOk && geoOk
  })

  // Conteggio per area geografica
  const geoCounts = GEO.reduce((acc, g) => {
    acc[g.slug] = g.slug === '' ? allArticles.length : allArticles.filter((a) => a.geo === g.slug).length
    return acc
  }, {} as Record<string, number>)

  function buildUrl(newCat?: string, newArea?: string) {
    const params = new URLSearchParams()
    const c = newCat !== undefined ? newCat : (categoria ?? '')
    const g = newArea !== undefined ? newArea : (area ?? '')
    if (c) params.set('categoria', c)
    if (g) params.set('area', g)
    const q = params.toString()
    return q ? `/news?${q}` : '/news'
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Riga categorie — una sola riga orizzontale scrollabile */}
        <div className="overflow-x-auto pb-2 mb-6 border-b border-gray-800">
          <div className="flex gap-1.5 min-w-max">
            {CATEGORIES.map((cat) => (
              <a
                key={cat.slug}
                href={buildUrl(cat.slug, area)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  cat.slug === (categoria ?? '')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                {cat.label}
              </a>
            ))}
          </div>
        </div>

        {/* Layout: sidebar geo + griglia articoli */}
        <div className="flex gap-6">

          {/* Sidebar geo — verticale */}
          <aside className="w-44 shrink-0 hidden md:block">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Area geografica</p>
            <div className="flex flex-col gap-1">
              {GEO.map((g) => (
                <a
                  key={g.slug}
                  href={buildUrl(categoria, g.slug)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    g.slug === (area ?? '')
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span>{g.icon} {g.label}</span>
                  <span className={`text-xs ${g.slug === (area ?? '') ? 'text-purple-200' : 'text-gray-600'}`}>
                    {geoCounts[g.slug]}
                  </span>
                </a>
              ))}
            </div>

            {/* Link mappa */}
            <a
              href="/mappa"
              className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-blue-400 hover:bg-gray-800 transition-colors border border-gray-800"
            >
              🗺️ Vedi su mappa
            </a>
          </aside>

          {/* Contenuto principale */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 mb-5">
              {filtered.length} articoli · {new Set(filtered.map((a) => a.source)).size} fonti
            </p>

            {filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-600">
                Nessun articolo trovato per questa combinazione di filtri.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((article, i) => {
                  const analysisId = Buffer.from(article.title).toString('base64url')
                  return (
                    <div key={i} className="group rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800 transition-all overflow-hidden">
                      <a href={`/articolo/${analysisId}`} className="block p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-blue-400">{article.source}</span>
                          <span className="text-xs text-gray-500">{timeAgo(article.pubDate)}</span>
                        </div>
                        <h2 className="font-semibold text-white mb-2 leading-snug group-hover:text-blue-300 transition-colors line-clamp-3">
                          {article.title}
                        </h2>
                        {article.summary && (
                          <p className="text-sm text-gray-400 line-clamp-2 mb-3">{article.summary}</p>
                        )}
                        <div className="flex gap-1.5 mb-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">{article.category}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500">{article.geo}</span>
                        </div>
                      </a>
                      <div className="px-5 pb-4 flex items-center justify-between border-t border-gray-800 pt-3">
                        <a href={`/articolo/${analysisId}`} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                          ⚖️ Analisi Veritas
                        </a>
                        <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                          Apri originale ↗
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
