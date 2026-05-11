import { fetchArticles, timeAgo } from '../../lib/rss'

const CATEGORIES = [
  { label: 'Tutte', slug: '' },
  { label: '🔴 Ultime notizie', slug: 'breaking' },
  { label: '⚔️ Conflitti', slug: 'conflitti' },
  { label: '🏛️ Politica', slug: 'politica' },
  { label: '📈 Economia', slug: 'economia' },
  { label: '🤖 Tecnologia', slug: 'tecnologia' },
  { label: '🔬 Scienza', slug: 'scienza' },
  { label: '🏥 Salute', slug: 'salute' },
  { label: '🌍 Ambiente', slug: 'ambiente' },
  { label: '⚽ Sport', slug: 'sport' },
  { label: '🎭 Cultura', slug: 'cultura' },
  { label: '📰 Cronaca', slug: 'cronaca' },
]

const GEO = [
  { label: '🌐 Tutto il mondo', slug: '' },
  { label: '🇪🇺 Europa', slug: 'europa' },
  { label: '🌎 Americhe', slug: 'americhe' },
  { label: '🕌 Medio Oriente', slug: 'medio-oriente' },
  { label: '🌏 Asia', slug: 'asia' },
  { label: '🌍 Africa', slug: 'africa' },
  { label: '🌊 Oceania', slug: 'oceania' },
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Notizie</h1>

        {/* Filtro categoria */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Categoria</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <a
                key={cat.slug}
                href={buildUrl(cat.slug, area)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  cat.slug === (categoria ?? '')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {cat.label}
              </a>
            ))}
          </div>
        </div>

        {/* Filtro area geografica */}
        <div className="mb-8">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Area geografica</p>
          <div className="flex flex-wrap gap-2">
            {GEO.map((g) => (
              <a
                key={g.slug}
                href={buildUrl(categoria, g.slug)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  g.slug === (area ?? '')
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {g.label}
              </a>
            ))}
          </div>
        </div>

        {/* Contatore */}
        <p className="text-sm text-gray-500 mb-6">
          {filtered.length} articoli · {new Set(filtered.map((a) => a.source)).size} fonti
        </p>

        {/* Articoli */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            Nessun articolo trovato per questa combinazione di filtri.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article, i) => (
              <a
                key={i}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-gray-800 bg-gray-900 p-5 hover:border-gray-600 hover:bg-gray-800 transition-all"
              >
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
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400">{article.category}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400">{article.geo}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
