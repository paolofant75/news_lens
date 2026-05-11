import Link from 'next/link'
import { fetchArticles, timeAgo } from '../lib/rss'
import { translateBatch } from '../lib/translate'
import { cookies } from 'next/headers'
import HomeNewsFeed from '../components/home-news-feed'
import { encodeArticleId } from '../lib/encode'

const NAV_ITEMS = [
  { href: '/news',      icon: '📰', label: 'Notizie',       badge: null },
  { href: '/veritas',   icon: '⚖️', label: 'Veritas',       badge: 'AI' },
  { href: '/mappa',     icon: '🌍', label: 'Mappa Globale', badge: null },
  { href: '/dashboard', icon: '📡', label: 'API Status',    badge: null },
]

const CATEGORIES = [
  { slug: 'breaking',   icon: '🔴', label: 'Breaking' },
  { slug: 'conflitti',  icon: '⚔️', label: 'Conflitti' },
  { slug: 'politica',   icon: '🏛️', label: 'Politica' },
  { slug: 'economia',   icon: '📈', label: 'Economia' },
  { slug: 'tecnologia', icon: '🤖', label: 'Tecnologia' },
  { slug: 'scienza',    icon: '🔬', label: 'Scienza' },
  { slug: 'salute',     icon: '🏥', label: 'Salute' },
  { slug: 'ambiente',   icon: '🌿', label: 'Ambiente' },
  { slug: 'sport',      icon: '⚽', label: 'Sport' },
  { slug: 'cultura',    icon: '🎭', label: 'Cultura' },
]

export const revalidate = 300

export default async function HomePage() {
  const cookieStore = await cookies()
  const lang = cookieStore.get('nlv_lang')?.value ?? 'it'

  const articles = await fetchArticles()
  const raw12 = articles.slice(0, 12)

  const translated12 = await translateBatch(
    raw12.map((a) => ({ title: a.title, summary: a.summary })),
    lang
  )
  const top = raw12.map((a, i) => ({ ...a, title: translated12[i]?.title ?? a.title, summary: translated12[i]?.summary ?? a.summary }))

  const featured = top[0]
  const secondary = top.slice(1, 5)

  const catCounts = CATEGORIES.reduce((acc, c) => {
    acc[c.slug] = articles.filter((a) => a.category === c.slug).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Sidebar ── */}
      <aside
        className="hidden lg:flex flex-col w-56 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto"
        style={{ background: 'var(--bg-s)', borderRight: '1px solid var(--border)' }}
      >
        <div className="p-4 space-y-6">
          {/* Workspace */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2 px-2" style={{ color: 'var(--text-3)' }}>Workspace</p>
            <nav className="space-y-0.5">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-2)' }}
                >
                  <span className="flex items-center gap-2.5">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className="text-xs px-1.5 py-0.5 rounded font-semibold text-white" style={{ background: 'var(--accent)' }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Categorie */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2 px-2" style={{ color: 'var(--text-3)' }}>Categorie</p>
            <nav className="space-y-0.5">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/news?categoria=${cat.slug}`}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-2)' }}
                >
                  <span className="flex items-center gap-2.5">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>{catCounts[cat.slug] ?? 0}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer sidebar */}
        <div className="mt-auto p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-3)' }}>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Live · {articles.length} storie</span>
          </div>
        </div>
      </aside>

      {/* ── Contenuto principale ── */}
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Hero — notizia in evidenza */}
          {featured && (
            <div className="mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-3)' }}>
                Today's Brief
              </p>
              <div
                className="rounded-2xl p-8"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: 'var(--accent)' }}>
                    {featured.category}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                    {featured.source} · {timeAgo(featured.pubDate)}
                  </span>
                </div>
                <h1
                  className="text-3xl font-bold leading-tight mb-3"
                  style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}
                >
                  {featured.title}
                </h1>
                {featured.summary && (
                  <p className="text-base mb-6 leading-relaxed" style={{ color: 'var(--text-2)' }}>
                    {featured.summary}
                  </p>
                )}
                <div className="flex gap-3">
                  <Link
                    href={`/articolo/${encodeArticleId(featured.title)}`}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: 'var(--accent)' }}
                  >
                    ⚖️ Analisi Veritas
                  </Link>
                  <a
                    href={featured.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                    style={{ background: 'var(--bg-s)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                  >
                    Originale ↗
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Griglia secondaria */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
                Ultime notizie
              </p>
              <Link href="/news" className="text-xs hover:opacity-80" style={{ color: 'var(--accent)' }}>
                Vedi tutte →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {secondary.map((article, i) => (
                <Link
                  key={i}
                  href={`/news`}
                  className="group p-5 rounded-xl transition-all hover:opacity-90"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>{article.source}</span>
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>{timeAgo(article.pubDate)}</span>
                  </div>
                  <h3 className="font-semibold leading-snug line-clamp-2" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
                    {article.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>

          {/* Feed con toggle griglia/lista */}
          <HomeNewsFeed articles={top.slice(4)} />
        </div>
      </main>
    </div>
  )
}
