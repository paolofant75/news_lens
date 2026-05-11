import MapClient from './map-client'
import { fetchArticles } from '../../lib/rss'

export const revalidate = 300

export default async function MappaPage() {
  const articles = await fetchArticles()

  const counts: Record<string, number> = {}
  for (const a of articles) {
    counts[a.geo] = (counts[a.geo] ?? 0) + 1
  }

  return <MapClient articles={articles} counts={counts} />
}
