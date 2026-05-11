import { fetchArticles, timeAgo } from '../../lib/rss'

const CATEGORIES = [
  { label: 'Tutte', slug: '' },
  { label: 'Ultime notizie', slug: 'breaking' },
  { label: 'Conflitti e crisi', slug: 'conflitti' },
  { label: 'Politica', slug: 'politica' },
  { label: 'Economia e finanza', slug: 'economia' },
  { label: 'Tecnologia e AI', slug: 'tecnologia' },
  { label: 'Scienza', slug: 'scienza' },
  { label: 'Salute', slug: 'salute' },
  { label: 'Ambiente e clima', slug: 'ambiente' },
  { label: 'Sport', slug: 'sport' },
  { label: 'Cultura e società', slug: 'cultura' },
  { label: 'Cronaca', slug: 'cronaca' },
]

export const revalidate = 300

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const { categoria } = await searchParams
  const currentCat = CATEGORIES.find((c) => c.slug === (categoria ?? '')) ?? CATEGORIES[0]
  const articles = await fetchArticles()

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          {currentCat.slug === '' ? 'Tutte le notizie' : currentCat.label}
        </h1>

        {/* Filtri */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.slug}
              href={cat.slug ? `/news?categoria=${cat.slug}` : '/news'}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                cat.slug === (categoria ?? '')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {cat.label}
            </a>
          ))}
        </div>

        {/* Contatore */}
        <p className="text-sm text-gray-500 mb-6">{articles.length} articoli da {new Set(articles.map(a => a.source)).size} fonti</p>

        {/* Articoli */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => (
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
                <p className="text-sm text-gray-400 line-clamp-2">{article.summary}</p>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
