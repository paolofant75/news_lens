import Link from 'next/link'
import { fetchArticles, timeAgo } from '../lib/rss'
import { translateBatch } from '../lib/translate'
import { cookies } from 'next/headers'
import HomeNewsFeed from '../components/home-news-feed'
import Sidebar from '../components/sidebar'
import { encodeArticleId } from '../lib/encode'
import { fetchTrending, scoredArticles } from '../lib/trends'

export const revalidate = 120

export default async function HomePage() {
  const cookieStore = await cookies()
  const lang = cookieStore.get('nlv_lang')?.value ?? 'it'

  const [articles, trends] = await Promise.all([
    fetchArticles(),
    fetchTrending(lang),
  ])

  // Ordina per rilevanza: trending match + recency + affidabilità fonte
  const ranked = scoredArticles(articles, trends)
  const raw12 = ranked.slice(0, 12)

  const translated12 = await translateBatch(
    raw12.map((a) => ({ title: a.title, summary: a.summary })),
    lang
  )
  const top = raw12.map((a, i) => ({
    ...a,
    originalTitle: a.title,
    title: translated12[i]?.title ?? a.title,
    summary: translated12[i]?.summary ?? a.summary,
  }))

  const featured = top[0]
  const secondary = top.slice(1, 5)

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar />

      {/* ── Contenuto principale ── */}
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Trending ora — Google Trends */}
          {trends.length > 0 && (
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>
                Trending ora
              </p>
              <div className="flex flex-wrap gap-2">
                {trends.slice(0, 6).map((t, i) => (
                  <a
                    key={i}
                    href={`/veritas?q=${encodeURIComponent(t.title)}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-opacity hover:opacity-80"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                    {t.title}
                    {t.traffic && <span className="opacity-50">{t.traffic}</span>}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Hero — notizia più rilevante */}
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
                    href={`/articolo/${encodeArticleId(featured.originalTitle ?? featured.title)}`}
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
                  href={`/articolo/${encodeArticleId(article.originalTitle ?? article.title)}`}
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
