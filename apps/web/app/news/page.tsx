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

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const { categoria } = await searchParams
  const currentCat = CATEGORIES.find((c) => c.slug === categoria) ?? CATEGORIES[0]

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Titolo */}
        <h1 className="text-3xl font-bold mb-6">
          {currentCat.slug === '' ? 'Tutte le notizie' : currentCat.label}
        </h1>

        {/* Filtri categoria */}
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

        {/* Placeholder articoli */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <div className="h-3 bg-gray-700 rounded mb-3 w-1/3 animate-pulse" />
              <div className="h-5 bg-gray-700 rounded mb-2 animate-pulse" />
              <div className="h-5 bg-gray-700 rounded mb-4 w-3/4 animate-pulse" />
              <div className="h-3 bg-gray-800 rounded mb-2 animate-pulse" />
              <div className="h-3 bg-gray-800 rounded w-2/3 animate-pulse" />
            </div>
          ))}
        </div>

        <p className="text-center text-gray-600 mt-12 text-sm">
          Connessione ai feed RSS in corso — Passo 2
        </p>
      </div>
    </div>
  )
}
