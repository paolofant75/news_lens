import { fetchArticles, timeAgo, biasColor } from '../../lib/rss'
import { encodeArticleId } from '../../lib/encode'
import { translateBatch } from '../../lib/translate'
import { cookies } from 'next/headers'
import PageLayout from '../../components/page-layout'

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
  const cookieStore = await cookies()
  const lang = cookieStore.get('nlv_lang')?.value ?? 'it'

  const allArticles = await fetchArticles()

  const filtered = allArticles.filter((a) => {
    const catOk = !categoria || a.category === categoria
    const geoOk = !area || a.geo === area
    return catOk && geoOk
  })

  // Traduci i titoli/summary nella lingua selezionata (max 50, con cache Redis)
  const translated = await translateBatch(
    filtered.slice(0, 50).map((a) => ({ title: a.title, summary: a.summary })),
    lang
  )
  const filteredT = filtered.slice(0, 50).map((a, i) => ({ ...a, title: translated[i]?.title ?? a.title, summary: translated[i]?.summary ?? a.summary }))

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
    <PageLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Categorie */}
        <div className="overflow-x-auto pb-2 mb-6" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex gap-1.5 min-w-max">
            {CATEGORIES.map((cat) => (
              <a key={cat.slug} href={buildUrl(cat.slug, area)}
                className="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-opacity hover:opacity-80"
                style={cat.slug === (categoria ?? '')
                  ? { background: 'var(--accent)', color: '#fff' }
                  : { background: 'var(--bg-card)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
              >
                {cat.icon && <span className="mr-1">{cat.icon}</span>}{cat.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar geo */}
          <aside className="w-44 shrink-0 hidden md:block">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 px-1" style={{ color: 'var(--text-3)' }}>Area geografica</p>
            <div className="flex flex-col gap-0.5">
              {GEO.map((g) => (
                <a key={g.slug} href={buildUrl(categoria, g.slug)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-opacity hover:opacity-80"
                  style={g.slug === (area ?? '')
                    ? { background: 'var(--accent)', color: '#fff' }
                    : { color: 'var(--text-2)' }}
                >
                  <span>{g.icon} {g.label}</span>
                  <span className="text-xs" style={{ color: g.slug === (area ?? '') ? 'rgba(255,255,255,0.7)' : 'var(--text-3)' }}>
                    {geoCounts[g.slug]}
                  </span>
                </a>
              ))}
            </div>
            <a href="/mappa" className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-opacity hover:opacity-80"
              style={{ color: 'var(--accent)', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              🗺️ Vedi su mappa
            </a>
          </aside>

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
                  const analysisId = encodeArticleId(article.title)
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
      </div>
    </PageLayout>
  )
}
