import Link from 'next/link'
import { fetchArticles, timeAgo } from '../../lib/rss'
import { translateBatch } from '../../lib/translate'
import { geoPersonalizedArticles, fetchTrending } from '../../lib/trends'
import { sortByPreferredLang } from '../../lib/lang-priority'
import { cookies, headers } from 'next/headers'

export default async function SecondaryGrid() {
  const cookieStore = await cookies()
  const lang = cookieStore.get('nlv_lang')?.value ?? 'it'
  const headerStore = await headers()
  const visitorCountry = headerStore.get('x-vercel-ip-country') ?? null

  const [articles, trends] = await Promise.all([fetchArticles(), fetchTrending(lang)])
  const ranked = geoPersonalizedArticles(articles, trends, visitorCountry)
  const ordered = sortByPreferredLang(ranked, lang)
  const secondary = ordered.slice(1, 5)

  const translated = await translateBatch(
    secondary.map((a) => ({ title: a.title, summary: a.summary, source: a.source })),
    lang
  )

  const items = secondary.map((a, i) => ({
    ...a,
    originalTitle: a.title,
    title: translated[i]?.title ?? a.title,
  }))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((article, i) => (
        <Link
          key={i}
          href={`/articolo/${article.id}`}
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
  )
}
