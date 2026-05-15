export interface RawItem {
  title: string
  url: string
  source: string
  published_at: string
  language: string
  content: string
  raw_category: string
}

export interface NewsItem {
  id: string
  title: string
  content: string
  source: string
  url: string
  published_at: string
  language: string
  category: string
  relevance_score?: number
}
