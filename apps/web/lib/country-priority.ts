import { COUNTRIES } from './countries'

export type Boosted<T> = T & { _countryBoostScore?: number }

export function boostByCountry<T extends { title: string; summary?: string }>(
  articles: T[],
  userCountry: string,
  boostMultiplier: number = 0.3
): Boosted<T>[] {
  const countryData = COUNTRIES.find(c => c.code === userCountry)
  if (!countryData) return articles as Boosted<T>[]

  const keywords = countryData.searchTerms.map(k => k.toLowerCase())

  return articles.map(article => {
    const text = `${article.title} ${article.summary || ''}`.toLowerCase()

    const matchCount = keywords.filter(kw => text.includes(kw)).length
    const hasCountryMatch = matchCount > 0

    return {
      ...article,
      _countryBoostScore: hasCountryMatch ? 1 + boostMultiplier : 1,
    } as Boosted<T>
  }).sort((a, b) => {
    const scoreA = a._countryBoostScore || 1
    const scoreB = b._countryBoostScore || 1

    if (scoreA !== scoreB) {
      return scoreB - scoreA
    }

    return 0
  })
}

export function getCountryBoostScore<T extends { _countryBoostScore?: number }>(article: T): number {
  return article._countryBoostScore || 1
}
