import Link from 'next/link'
import { fetchArticles, timeAgo } from '../lib/rss'
import { translateBatch } from '../lib/translate'
import { cookies } from 'next/headers'
import HomeNewsFeed from '../components/home-news-feed'
import Sidebar from '../components/sidebar'
import { encodeArticleId } from '../lib/encode'
import { fetchTrending, scoredArticles } from '../lib/trends'
import { CATEGORY_COLORS } from '../lib/geo-extract'

export const revalidate = 120

function PrismSVG({ accent }: { accent: string }) {
  // Entry point on left face of triangle, exit fan on right
  return (
    <svg viewBox="0 0 320 220" width="320" height="220" aria-hidden="true">
      {/* Triangle */}
      <polygon
        points="160,28 64,192 256,192"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.2"
      />
      {/* White input ray: from left → enters left face midpoint */}
      <line x1="0" y1="110" x2="112" y2="110" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" />
      {/* Colored output rays: fan out from right face toward right */}
      <line x1="112" y1="110" x2="320" y2="60"  stroke="#ef4444" strokeWidth="1.3" opacity="0.85" />
      <line x1="112" y1="110" x2="320" y2="82"  stroke="#f97316" strokeWidth="1.3" opacity="0.80" />
      <line x1="112" y1="110" x2="320" y2="105" stroke="#eab308" strokeWidth="1.3" opacity="0.80" />
      <line x1="112" y1="110" x2="320" y2="128" stroke="#22c55e" strokeWidth="1.3" opacity="0.80" />
      <line x1="112" y1="110" x2="320" y2="150" stroke={accent}  strokeWidth="1.3" opacity="0.85" />
      <line x1="112" y1="110" x2="320" y2="172" stroke="#a855f7" strokeWidth="1.3" opacity="0.80" />
    </svg>
  )
}

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
          {featured && (() => {
            const accent = CATEGORY_COLORS[featured.category] ?? 'var(--accent)'
            return (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
                    Today&apos;s Brief
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                    {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>

                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <div className="grid grid-cols-1 md:grid-cols-5">

                    {/* Sinistra — infografica prism */}
                    <div
                      className="md:col-span-2 relative flex flex-col justify-between p-6 min-h-[220px]"
                      style={{ background: '#0d0d0d', borderRight: '1px solid var(--border)' }}
                    >
                      {/* Prism SVG centrato */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PrismSVG accent={accent} />
                      </div>

                      {/* Badge categoria in alto */}
                      <div className="relative z-10">
                        <span
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                          style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44` }}
                        >
                          {featured.category}
                        </span>
                      </div>

                      {/* Badge live in basso */}
                      <div className="relative z-10 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                        <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          LIVE STORY · {featured.source}
                        </span>
                      </div>
                    </div>

                    {/* Destra — testo */}
                    <div
                      className="md:col-span-3 p-7 flex flex-col justify-between gap-5"
                      style={{ background: 'var(--bg-card)' }}
                    >
                      <div>
                        <p className="text-xs mb-3" style={{ color: 'var(--text-3)' }}>
                          {timeAgo(featured.pubDate)}
                        </p>
                        <h1
                          className="text-2xl md:text-3xl font-bold leading-tight mb-4"
                          style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}
                        >
                          {featured.title}
                        </h1>
                        {featured.summary && (
                          <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-2)' }}>
                            {featured.summary}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3 flex-wrap">
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
                </div>
              </div>
            )
          })()}

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
