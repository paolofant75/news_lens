export const CONFIG = {
  INTERVAL_MINUTES: 5,
  MAX_ARTICLES_PER_SOURCE: 50,
  DEDUP_TITLE_SIMILARITY: 0.85,
  AI_ENRICH: !!process.env.ANTHROPIC_API_KEY,
  SQLITE_PATH: process.env.SQLITE_PATH ?? './data/news.db',
  JSON_PATH: './data/news.json',
  FETCH_TIMEOUT_MS: 10_000,
  FETCH_RETRIES: 2,
}

export const GOOGLE_NEWS_FEEDS = [
  {
    url: 'https://news.google.com/rss?hl=en&gl=US&ceid=US:en',
    category: 'general',
  },
  {
    url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en&gl=US&ceid=US:en',
    category: 'world',
  },
  {
    url: 'https://news.google.com/rss/topics/CAAqIggKIhxDQkFTRHdvSkwyMHZNR1ptZHpWbUVnSmxiaWdBUAE?hl=en&gl=US&ceid=US:en',
    category: 'technology',
  },
  {
    url: 'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtVnVLQUFQAQ?hl=en&gl=US&ceid=US:en',
    category: 'business',
  },
]

// Direct official RSS feeds (used as "rsshub" channel — more reliable than rsshub.app public)
export const RSSHUB_FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml',              source: 'BBC World',   category: 'world' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml',                source: 'Al Jazeera',  category: 'world' },
  { url: 'https://rss.dw.com/rdf/rss-en-all',                        source: 'DW',          category: 'world' },
  { url: 'https://feeds.feedburner.com/time/world',                   source: 'TIME World',  category: 'world' },
]
