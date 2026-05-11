import Parser from 'rss-parser'

const parser = new Parser({
  timeout: 8000,
  headers: { 'User-Agent': 'NewsLensVeritas/1.0' },
})

export type Article = {
  title: string
  link: string
  pubDate: string
  source: string
  summary: string
  category: string
  geo: string
}

const FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml',        source: 'BBC News' },
  { url: 'https://www.theguardian.com/world/rss',              source: 'The Guardian' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml',          source: 'Al Jazeera' },
  { url: 'https://feeds.npr.org/1001/rss.xml',                 source: 'NPR' },
  { url: 'https://rss.dw.com/xml/rss-en-world',                source: 'Deutsche Welle' },
  { url: 'https://www.france24.com/en/rss',                    source: 'France 24' },
  { url: 'https://feeds.feedburner.com/ndtvnews-top-stories',  source: 'NDTV' },
  { url: 'https://www.ansa.it/sito/notizie/mondo/mondo_rss.xml', source: 'ANSA' },
]

function categorize(title: string, summary: string): string {
  const t = (title + ' ' + summary).toLowerCase()
  if (/\bbreaking\b|urgent|alert/.test(t)) return 'breaking'
  if (/war|conflict|attack|military|troops|missile|bomb|battle|fighting|killed|airstrike|ceasefire/.test(t)) return 'conflitti'
  if (/election|president|minister|parliament|government|senate|vote|political|party|democrat|republican|diplomat/.test(t)) return 'politica'
  if (/economy|market|trade|finance|gdp|inflation|stock|bank|crypto|bitcoin|recession|tariff|interest rate/.test(t)) return 'economia'
  if (/technology|artificial intelligence|\bai\b|tech\b|digital|software|startup|apple|google|meta|microsoft|openai|nvidia/.test(t)) return 'tecnologia'
  if (/\bscience\b|research|study|space|nasa|discovery|physics|biology|asteroid|planet/.test(t)) return 'scienza'
  if (/health|medical|disease|vaccine|hospital|cancer|virus|pandemic|covid|mental health/.test(t)) return 'salute'
  if (/climate|environment|carbon|emissions|renewable|flood|wildfire|drought|deforestation|pollution/.test(t)) return 'ambiente'
  if (/football|soccer|tennis|olympics|championship|league|\bnba\b|\bnfl\b|\bfifa\b|sport|tournament|match/.test(t)) return 'sport'
  if (/culture|art|film|music|book|award|festival|cinema|literature|exhibition/.test(t)) return 'cultura'
  return 'cronaca'
}

function geoClassify(title: string, summary: string): string {
  const t = (title + ' ' + summary).toLowerCase()
  if (/israel|palestin|iran|iraq|syria|saudi|lebanon|jordan|yemen|gulf|middle east|hamas|hezbollah|gaza/.test(t)) return 'medio-oriente'
  if (/\bchina\b|japan|india|\bkorea\b|taiwan|hong kong|singapore|myanmar|thailand|vietnam|beijing|tokyo|delhi|pakistan|bangladesh/.test(t)) return 'asia'
  if (/russia|ukraine|europe\b|\beu\b|brussels|nato|france|germany|italy|spain|\buk\b|britain|poland|hungary|turkey|balkans/.test(t)) return 'europa'
  if (/\busa\b|\bus\b|united states|american|washington|trump|biden|harris|congress|canada|mexico|brazil|argentina|colombia|latin america/.test(t)) return 'americhe'
  if (/africa|nigeria|ethiopia|kenya|south africa|egypt|sudan|ghana|tanzania|congo|somalia|senegal/.test(t)) return 'africa'
  if (/australia|new zealand|\bpacific\b|oceania|papua/.test(t)) return 'oceania'
  return 'mondo'
}

export async function fetchArticles(): Promise<Article[]> {
  const results = await Promise.allSettled(
    FEEDS.map(async ({ url, source }) => {
      const feed = await parser.parseURL(url)
      return feed.items.slice(0, 10).map((item) => {
        const title = item.title ?? ''
        const summary = item.contentSnippet ?? item.summary ?? ''
        return {
          title,
          link: item.link ?? '',
          pubDate: item.pubDate ?? item.isoDate ?? '',
          source,
          summary,
          category: categorize(title, summary),
          geo: geoClassify(title, summary),
        }
      })
    })
  )

  return results
    .filter((r): r is PromiseFulfilledResult<Article[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .filter((a) => a.title && a.link)
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min} min fa`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h fa`
  return `${Math.floor(h / 24)}g fa`
}
