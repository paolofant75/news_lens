import dynamic from 'next/dynamic'

const HomeNewsFeed = dynamic(() => import('../../components/home-news-feed'), { ssr: true })
import { fetchArticles } from '../../lib/rss'
import { translateBatch } from '../../lib/translate'
import { geoPersonalizedArticles, fetchTrending } from '../../lib/trends'
import { sortByPreferredLang } from '../../lib/lang-priority'
import { cookies, headers } from 'next/headers'

export default async function FeedSection() {
  const cookieStore = await cookies()
  const lang = cookieStore.get('nlv_lang')?.value ?? 'it'
  const headerStore = await headers()
  const visitorCountry = headerStore.get('x-vercel-ip-country') ?? null

  const [articles, trends] = await Promise.all([fetchArticles(), fetchTrending(lang)])
  const ranked = geoPersonalizedArticles(articles, trends, visitorCountry)
  // Prioritizza fonti nella lingua dell'utente prima dello slice per evitare mix
  const ordered = sortByPreferredLang(ranked, lang)
  const feedArticles = ordered.slice(5, 30)

  const translated = await translateBatch(
    feedArticles.map((a) => ({ title: a.title, summary: a.summary })),
    lang
  )

  const withTranslations = feedArticles.map((a, i) => ({
    ...a,
    originalTitle: a.title,
    title: translated[i]?.title ?? a.title,
    summary: translated[i]?.summary ?? a.summary,
  }))

  return <HomeNewsFeed articles={withTranslations} />
}
