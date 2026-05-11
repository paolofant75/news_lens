import Link from 'next/link'

const CATEGORIES = [
  { label: 'Ultime notizie', slug: 'breaking', icon: '🔴', desc: 'Breaking news in tempo reale' },
  { label: 'Conflitti e crisi', slug: 'conflitti', icon: '⚔️', desc: 'Guerra, tensioni, crisi internazionali' },
  { label: 'Politica', slug: 'politica', icon: '🏛️', desc: 'Governi, elezioni, diplomazia' },
  { label: 'Economia e finanza', slug: 'economia', icon: '📈', desc: 'Mercati, banche, commercio globale' },
  { label: 'Tecnologia e AI', slug: 'tecnologia', icon: '🤖', desc: 'Innovazione, big tech, intelligenza artificiale' },
  { label: 'Scienza', slug: 'scienza', icon: '🔬', desc: 'Ricerca, scoperte, spazio' },
  { label: 'Salute', slug: 'salute', icon: '🏥', desc: 'Medicina, epidemie, benessere' },
  { label: 'Ambiente e clima', slug: 'ambiente', icon: '🌍', desc: 'Cambiamento climatico, energia, natura' },
  { label: 'Sport', slug: 'sport', icon: '⚽', desc: 'Calcio, olimpiadi, competizioni mondiali' },
  { label: 'Cultura e società', slug: 'cultura', icon: '🎭', desc: 'Arte, cinema, tendenze sociali' },
  { label: 'Cronaca', slug: 'cronaca', icon: '📰', desc: 'Fatti del giorno da tutto il mondo' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          News Lens Veritas
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Notizie globali da centinaia di fonti. Analisi anti-bias con AI.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/news"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            Esplora le notizie
          </Link>
          <Link
            href="/mappa"
            className="px-6 py-3 border border-gray-700 hover:bg-gray-900 rounded-lg font-semibold transition-colors"
          >
            Mappa mondiale
          </Link>
        </div>
      </section>

      {/* Categorie */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-6 text-gray-100">Categorie</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/news?categoria=${cat.slug}`}
              className="group p-5 rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800 transition-all"
            >
              <div className="text-3xl mb-3">{cat.icon}</div>
              <h3 className="font-semibold text-white mb-1">{cat.label}</h3>
              <p className="text-sm text-gray-400">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
