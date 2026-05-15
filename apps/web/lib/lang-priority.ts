// Priorità fonti per lingua utente — usato da news/_home/feed per mostrare prima
// gli articoli nella lingua del lettore e ridurre traduzioni mancanti

const SOURCE_LANG_MAP: Record<string, string[]> = {
  it: ['ansa', 'corriere', 'repubblica', 'sole 24', 'la stampa', 'fatto quotidiano', 'huffpost', 'sky tg24', 'adnkronos', 'messaggero', 'open online', 'rai'],
  en: ['bbc', 'reuters', 'ap news', 'guardian', 'nyt', 'cnn', 'washington post', 'bloomberg', 'al jazeera english', 'scmp', 'wired', 'techcrunch', 'mit', 'arstechnica'],
  fr: ['france 24', 'le monde', 'le figaro', 'le parisien'],
  de: ['dw', 'spiegel', 'zeit', 'faz'],
  es: ['el país', 'el mundo', 'abc'],
}

type SourceLike = { source: string; pubDate: string }

export function sortByPreferredLang<T extends SourceLike>(items: T[], lang: string): T[] {
  const preferred = SOURCE_LANG_MAP[lang]
  if (!preferred || preferred.length === 0) return items
  const match = (src: string) => preferred.some((kw) => src.toLowerCase().includes(kw))
  return [...items].sort((a, b) => {
    const am = match(a.source) ? 1 : 0
    const bm = match(b.source) ? 1 : 0
    if (am !== bm) return bm - am
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  })
}

export function isPreferredLangSource(source: string, lang: string): boolean {
  const preferred = SOURCE_LANG_MAP[lang]
  if (!preferred) return false
  return preferred.some((kw) => source.toLowerCase().includes(kw))
}
