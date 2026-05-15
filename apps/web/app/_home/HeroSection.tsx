import Link from 'next/link'
import { fetchArticles, timeAgo } from '../../lib/rss'
import { translateBatch } from '../../lib/translate'
import { geoPersonalizedArticles, fetchTrending } from '../../lib/trends'
import { sortByPreferredLang } from '../../lib/lang-priority'
import { fetchGlobalStats, getRelevantStats } from '../../lib/stats'
import { cookies, headers } from 'next/headers'
import { encodeArticleId } from '../../lib/encode'
import { CATEGORY_COLORS } from '../../lib/geo-extract'
import HeroStatsCarousel from '../../components/hero-stats-carousel'

export default async function HeroSection() {
  const cookieStore = await cookies()
  const lang = cookieStore.get('nlv_lang')?.value ?? 'it'
  const headerStore = await headers()
  const visitorCountry = headerStore.get('x-vercel-ip-country') ?? null

  const [articles, trends, allStats] = await Promise.all([
    fetchArticles(),
    fetchTrending(lang),
    fetchGlobalStats(),
  ])

  const ranked = geoPersonalizedArticles(articles, trends, visitorCountry)
  const ordered = sortByPreferredLang(ranked, lang)
  const featured = ordered[0]
  if (!featured) return null

  const [[translatedFeat]] = await Promise.all([
    translateBatch([{ title: featured.title, summary: featured.summary }], lang),
  ])

  const article = {
    ...featured,
    originalTitle: featured.title,
    title: translatedFeat?.title ?? featured.title,
    summary: translatedFeat?.summary ?? featured.summary,
  }

  const accent = CATEGORY_COLORS[article.category] ?? 'var(--accent)'
  const heroStats = getRelevantStats(`${article.title} ${article.category}`, allStats, 5)

  return (
    <>
      {/* Trending chips */}
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

      {/* Hero card */}
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

            {/* Sinistra — carosello statistiche */}
            <div
              className="md:col-span-2 relative min-h-[260px] md:min-h-0"
              style={{ background: '#0d0d0d', borderRight: '1px solid var(--border)' }}
            >
              <HeroStatsCarousel stats={heroStats} accent={accent} />
            </div>

            {/* Destra — testo */}
            <div
              className="md:col-span-3 p-7 flex flex-col justify-between gap-5"
              style={{ background: 'var(--bg-card)' }}
            >
              <div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-3)' }}>
                  {timeAgo(article.pubDate)}
                </p>
                <h1
                  className="text-2xl md:text-3xl font-bold leading-tight mb-4"
                  style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}
                >
                  {article.title}
                </h1>
                {article.summary && (
                  <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-2)' }}>
                    {article.summary}
                  </p>
                )}
              </div>

              <div className="flex gap-3 flex-wrap">
                <Link
                  href={`/articolo/${encodeArticleId(article.originalTitle ?? article.title)}`}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'var(--accent)' }}
                >
                  ⚖️ Analisi Veritas
                </Link>
                <a
                  href={article.link}
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
    </>
  )
}
