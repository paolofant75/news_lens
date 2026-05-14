import { fetchGlobalStats } from '../../lib/stats'
import { fetchArticles } from '../../lib/rss'
import { cookies } from 'next/headers'
import { translateBatch } from '../../lib/translate'
import { encodeArticleId } from '../../lib/encode'
import PageLayout from '../../components/page-layout'
import Link from 'next/link'
import Data360Insights from '../../components/data360-insights'

export const revalidate = 86400 // 24h

const TREND_ICON = { up: '↑', down: '↓', stable: '→' }
const TREND_COLOR = { up: '#22c55e', down: '#ef4444', stable: '#94a3b8' }

export default async function StatsPage() {
  const cookieStore = await cookies()
  const lang = cookieStore.get('nlv_lang')?.value ?? 'it'

  const [stats, allArticles] = await Promise.all([
    fetchGlobalStats(),
    fetchArticles(),
  ])

  // Per ogni stat trova gli articoli correlati
  const statWithArticles = await Promise.all(stats.map(async (stat) => {
    const related = allArticles
      .filter((a) => a.category === stat.linkedCategory)
      .slice(0, 2)

    const translated = related.length > 0
      ? await translateBatch(related.map((a) => ({ title: a.title, summary: '' })), lang)
      : []

    return {
      ...stat,
      articles: related.map((a, i) => ({
        ...a,
        originalTitle: a.title,
        title: translated[i]?.title ?? a.title,
      })),
    }
  }))

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
            Statistiche Globali
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            Dati verificati · World Bank, FAO, ITU · aggiornati ogni 24h
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {statWithArticles.map((stat) => (
            <div key={stat.id} className="rounded-2xl p-6"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>

              {/* Header */}
              <div className="flex items-start justify-between mb-1">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
                  {stat.label}
                </p>
                {stat.trend && (
                  <span className="text-xs font-bold" style={{ color: TREND_COLOR[stat.trend] }}>
                    {TREND_ICON[stat.trend]}
                  </span>
                )}
              </div>

              {/* Valore */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold" style={{ fontFamily: 'var(--font-h)', color: 'var(--accent)' }}>
                  {stat.value}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-3)' }}>{stat.unit}</span>
              </div>

              {/* Fatto curioso */}
              <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--text-2)' }}>
                💡 {stat.curiosity}
              </p>

              {/* Notizie correlate */}
              {stat.articles.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <p className="text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
                    Notizie correlate
                  </p>
                  <div className="space-y-2">
                    {stat.articles.map((a, i) => (
                      <Link
                        key={i}
                        href={`/articolo/${encodeArticleId(a.originalTitle ?? a.title)}`}
                        className="block text-xs transition-opacity hover:opacity-70 line-clamp-1"
                        style={{ color: 'var(--text-2)' }}
                      >
                        → {a.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] mt-3 opacity-40" style={{ color: 'var(--text-3)' }}>
                Fonte: {stat.source}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl p-5 text-center" style={{ background: 'var(--bg-s)', border: '1px solid var(--border)' }}>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
            Hai trovato una statistica interessante?
          </p>
          <p className="text-xs mb-3" style={{ color: 'var(--text-3)' }}>
            Analizza l&apos;argomento con Veritas per vedere come diverse fonti lo raccontano
          </p>
          <Link href="/veritas"
            className="inline-block px-5 py-2 rounded-xl text-sm font-semibold text-black transition-opacity hover:opacity-80"
            style={{ background: 'var(--accent)' }}>
            Apri Veritas ⚖️
          </Link>
        </div>

        <Data360Insights />
      </div>
    </PageLayout>
  )
}
