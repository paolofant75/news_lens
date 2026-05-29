import { cookies } from 'next/headers'
import { searchAllSources, analyzeWithVeritas, extractQueryFromUrl, cleanSearchQuery } from '../../../lib/veritas'
import { decodeArticleId } from '../../../lib/encode'
import { cacheGet } from '../../../lib/redis'
import type { Article } from '../../../lib/rss'
import type { SourceAnalysis } from '../../../lib/veritas'
import { fetchGlobalStats, getRelevantStats } from '../../../lib/stats'
import type { GlobalStat } from '../../../lib/stats'
import FiveWsCard from '../../../components/five-ws-card'
import Approfondimenti from '../../../components/approfondimenti'
import AudioReader from '../../../components/audio-reader'
import ArticleWithCitations from '../../../components/article-with-citations'
import ProspettiveCard from '../../../components/prospettive-card'
import ConsentReopenButton from '../../../components/consent-reopen-button'
import { IconSparkle, IconSearch, IconScale, IconNewspaper, IconCheck } from '../../../components/icons'

function BiasBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full bg-gray-800 rounded-full h-1.5">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  )
}

function biasColor(val: number) {
  if (val <= 20) return 'bg-green-500'
  if (val <= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

function scoreCard(a: SourceAnalysis) {
  return a.completezza - a.bias * 0.7
}

function badgeClass(tipo: string) {
  return tipo === 'neutro'
    ? 'bg-green-900 text-green-300'
    : tipo === 'sensazionalistico' || tipo === 'politico'
    ? 'bg-red-900 text-red-300'
    : 'bg-yellow-900 text-yellow-300'
}

const TREND_ICON: Record<string, string> = { up: '↑', down: '↓', stable: '→' }
const TREND_COLOR: Record<string, string> = { up: '#22c55e', down: '#ef4444', stable: '#94a3b8' }

export default async function ArticoloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const lang = cookieStore.get('nlv_lang')?.value ?? 'it'
  const palette = cookieStore.get('nlv_palette')?.value ?? 'noir'
  const aiConsent = cookieStore.get('nlv_ai_consent')?.value === '1'

  // Cache-first lookup: ricerca nella cache bulk (ARTICLES_FRESH_KEY)
  // per usare il titolo nella lingua nativa della fonte.
  let query = ''
  let searchQuery = ''
  let cachedArticle: Article | null = null
  try {
    // Prova a cercare nella cache bulk (fallback ottimizzato per ridurre comandi)
    const { cacheGet: redisGet } = await import('../../../lib/redis')
    const rawBulk = await redisGet('nlv_articles_v5')
    if (rawBulk) {
      const articles = JSON.parse(rawBulk) as Article[]
      cachedArticle = articles.find(a => a.id === id) ?? null
    }
  } catch {
    cachedArticle = null
  }

  if (cachedArticle) {
    query = cachedArticle.title
    // Se il classifier ha gia' estratto le seed5W, costruisci la query da
    // (who + what): preserva i nomi propri (es. "Blue Origin esplode razzo")
    // che cleanSearchQuery genericizzerebbe. Fallback a cleanSearchQuery
    // per articoli vecchi senza seed5W (cache classifier pre-feature).
    const seed = cachedArticle.aiSeed5W
    const seedQuery = seed ? [seed.who, seed.what].map((s) => s.trim()).filter(Boolean).join(' ').trim() : ''
    searchQuery = seedQuery.length >= 3 ? seedQuery : cleanSearchQuery(query)
  } else {
    // Backward compat: link vecchi base64-title o cache miss
    try {
      const decoded = decodeArticleId(id)
      query = decoded.startsWith('http') ? extractQueryFromUrl(decoded) : decoded
      searchQuery = cleanSearchQuery(query)
    } catch {
      query = id
      searchQuery = id
    }
  }

  if (!aiConsent) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="max-w-xl text-center px-6">
          <div className="flex justify-center mb-6" style={{ color: 'var(--accent)' }}>
            <IconSparkle size={48} />
          </div>
          <h1 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-h)' }}>
            Analisi Veritas richiede il consenso AI
          </h1>
          <p className="text-sm mb-2" style={{ color: 'var(--text-2)' }}>
            Per generare l&apos;Articolo Consolidato e l&apos;analisi anti-bias, Lens Veritas invia la tua ricerca ai modelli Claude (Anthropic) e Gemini (Google).
          </p>
          <p className="text-sm font-mono px-4 py-2 rounded-lg my-4" style={{ background: 'var(--bg-card)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
            &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-xs mb-6" style={{ color: 'var(--text-3)' }}>
            Per attivare l&apos;analisi, accetta la categoria <strong>Funzionalità AI</strong> dal banner cookie. Maggiori dettagli nella{' '}
            <a href="/cookie-policy" className="underline" style={{ color: 'var(--accent)' }}>Cookie Policy</a>.
          </p>
          <ConsentReopenButton label="Attiva consenso AI" />
          <div className="mt-6">
            <a href="/news" className="text-xs hover:underline" style={{ color: 'var(--text-3)' }}>
              ← Torna alle notizie
            </a>
          </div>
        </div>
      </div>
    )
  }

  const [articles, allStats] = await Promise.all([
    searchAllSources(searchQuery, cachedArticle?.aiSeed5W),
    fetchGlobalStats(),
  ])

  if (articles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="max-w-xl text-center px-6">
          <div className="flex justify-center mb-6" style={{ color: 'var(--text-3)' }}>
            <IconSearch size={48} />
          </div>
          <h1 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-h)' }}>Nessuna fonte trovata</h1>
          <p className="text-sm mb-2" style={{ color: 'var(--text-2)' }}>
            Le API di notizie non hanno restituito risultati per:
          </p>
          <p className="text-sm font-mono px-4 py-2 rounded-lg mb-6" style={{ background: 'var(--bg-card)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
            &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-xs mb-8" style={{ color: 'var(--text-3)' }}>
            Possibili cause: notizia troppo recente, argomento non coperto dalle API gratuite, o limite di quota raggiunto.
          </p>
          <div className="flex gap-3 justify-center">
            <a href="/news" className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: 'var(--bg-s)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
              ← Torna alle notizie
            </a>
            <a href={`/veritas?q=${encodeURIComponent(searchQuery)}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80"
              style={{ background: 'var(--accent)' }}>
              Cerca su Veritas <IconScale size={14} />
            </a>
          </div>
        </div>
      </div>
    )
  }

  const result = await analyzeWithVeritas(searchQuery, articles, lang)

  // Unisci fonti con la loro analisi, mostra tutto tranne non pertinente, ordina per score
  const sourcesWithAnalysis = result.sources
    .map((src, i) => ({
      src,
      analisi: result.analisi.find((a) => a.indice === i + 1 || a.fonte === src.source),
    }))
    .filter((x) => x.analisi && x.analisi.tipo_bias !== 'non pertinente')
    .sort((a, b) => scoreCard(b.analisi!) - scoreCard(a.analisi!))

  const totalSources = sourcesWithAnalysis.length
  const langLabel = lang !== 'en' ? ` (${lang.toUpperCase()})` : ''
  // Arricchisci la query con il contenuto degli articoli trovati per matching stats più preciso
  const contentContext = result.sources
    .slice(0, 5)
    .map((s) => s.content.slice(0, 300))
    .join(' ')
  const relevantStats = getRelevantStats(`${query} ${searchQuery} ${contentContext}`, allStats, 5)

  // Polo A = fonte più neutrale (primo nella lista ordinata per score)
  // Polo B = fonte con angolazione più marcata (ultima nella lista)
  const poleA = sourcesWithAnalysis[0]
  const poleB = sourcesWithAnalysis.length > 2
    ? sourcesWithAnalysis[sourcesWithAnalysis.length - 1]
    : sourcesWithAnalysis.length === 2
    ? sourcesWithAnalysis[1]
    : null
  const showProspettive = poleA && poleB && poleA.analisi && poleB.analisi && poleA.src.source !== poleB.src.source

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Back */}
        <a href="/news" className="inline-flex items-center gap-2 text-sm mb-8 transition-opacity hover:opacity-70" style={{ color: 'var(--text-2)' }}>
          ← Torna alle notizie
        </a>

        {/* Query */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>
            Analisi: <span style={{ color: 'var(--accent)' }}>{query}</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            {totalSources} fonti analizzate da Veritas{langLabel}
            {searchQuery !== query && (
              <span className="ml-2 opacity-60">(ricerca: &ldquo;{searchQuery}&rdquo;)</span>
            )}
          </p>
        </div>

        {/* Grid principale: Five Ws | Articolo | Statistiche */}
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-6 mb-12">

          {/* SINISTRA — Five Ws verticale (più larga per leggibilità) */}
          <div className="lg:col-span-2 order-last lg:order-first">
            {result.five_ws?.who && (
              <FiveWsCard five_ws={result.five_ws} title={query} palette={palette} vertical />
            )}
          </div>

          {/* CENTRO — Articolo ampliato */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl p-8 lg:p-10 h-full shadow-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--accent)' }}>
              <div className="flex items-start gap-3 mb-6">
                <IconNewspaper size={22} className="opacity-70 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-h)', color: 'var(--accent)' }}>
                    Articolo Consolidato Veritas
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                    Sintesi su cui {totalSources} {totalSources === 1 ? 'fonte converge' : 'fonti convergono'} · Le fonti di ogni affermazione sono indicate come pillole sotto ogni paragrafo
                  </p>
                  <p className="text-[10px] mt-1.5 px-1.5 py-0.5 rounded inline-flex items-center gap-1" style={{ background: 'var(--bg-s)', color: 'var(--text-3)', border: '1px solid var(--border)' }}>
                    <IconSparkle size={10} /> Generato da AI (Claude) · EU AI Act art. 50
                  </p>
                  <div className="mt-3">
                    <AudioReader text={result.articolo_consolidato} lang={lang} />
                  </div>
                </div>
              </div>

              <div className="text-base leading-relaxed">
                {result.articolo_consolidato ? (
                  <ArticleWithCitations text={result.articolo_consolidato} sources={result.sources} />
                ) : (
                  <p className="text-sm italic" style={{ color: 'var(--text-3)' }}>
                    Analisi Veritas non disponibile per questa notizia — le fonti trovate non contengono contenuto sufficiente per produrre un articolo consolidato.
                  </p>
                )}
              </div>

              {sourcesWithAnalysis.length > 0 && (
                <div className="mt-8 pt-6 grid grid-cols-3 gap-4 text-center" style={{ borderTop: '1px solid var(--border)' }}>
                  <div>
                    <p className="text-2xl font-bold text-green-400">
                      {Math.round(sourcesWithAnalysis.reduce((s, x) => s + (x.analisi?.completezza ?? 0), 0) / sourcesWithAnalysis.length)}%
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>Completezza media</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-400">
                      {Math.round(sourcesWithAnalysis.reduce((s, x) => s + (x.analisi?.bias ?? 0), 0) / sourcesWithAnalysis.length)}%
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>Bias medio</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{totalSources}</p>
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>Fonti analizzate</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DESTRA — Statistiche correlate */}
          <div className="lg:col-span-1 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest opacity-50">Dati</p>
            {relevantStats.map((stat) => (
              <div key={stat.id} className="rounded-xl p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wide mb-1 leading-tight" style={{ color: 'var(--text-3)' }}>
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-lg font-bold leading-none" style={{ color: 'var(--accent)' }}>
                    {stat.value}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>{stat.unit}</span>
                  {stat.trend && (
                    <span className="text-xs font-bold ml-auto" style={{ color: TREND_COLOR[stat.trend] }}>
                      {TREND_ICON[stat.trend]}
                    </span>
                  )}
                </div>
                <p className="text-[10px] mt-1.5 leading-snug opacity-70" style={{ color: 'var(--text-2)' }}>
                  {stat.curiosity}
                </p>
                <p className="text-[9px] mt-1 opacity-40" style={{ color: 'var(--text-3)' }}>{stat.source}</p>
              </div>
            ))}
          </div>

        </div>

        {/* SOTTO — Fonti analizzate (griglia orizzontale) */}
        <div className="pt-10" style={{ borderTop: '1px solid var(--border)' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-h)' }}>
            <IconScale size={20} className="opacity-50" /> Fonti Analizzate — Dalla più affidabile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sourcesWithAnalysis.map(({ src, analisi }, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 transition-all hover:scale-[1.02]"
                style={i === 0
                  ? { background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.4)' }
                  : { background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-col min-w-0 flex-1 pr-2">
                    {i === 0 && <span className="text-[10px] font-bold text-green-500 uppercase mb-1">Affidabilità Massima</span>}
                    <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>{src.source}</span>
                  </div>
                  <a href={src.link} target="_blank" rel="noopener noreferrer" className="shrink-0 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <IconSearch size={14} className="text-blue-400" />
                  </a>
                </div>

                <p className="text-xs mb-4 line-clamp-2 leading-snug" style={{ color: 'var(--text-3)' }}>{src.title}</p>

                {analisi && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-3)' }}>
                        <span>Completezza</span>
                        <span className="text-green-400">{analisi.completezza}%</span>
                      </div>
                      <BiasBar value={analisi.completezza} color="bg-green-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-3)' }}>
                        <span>Bias</span>
                        <span className={analisi.bias <= 20 ? 'text-green-400' : analisi.bias <= 50 ? 'text-yellow-400' : 'text-red-400'}>
                          {analisi.bias}%
                        </span>
                      </div>
                      <BiasBar value={analisi.bias} color={biasColor(analisi.bias)} />
                    </div>
                    <div className="flex items-start gap-2 pt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${badgeClass(analisi.tipo_bias)}`}>
                        {analisi.tipo_bias}
                      </span>
                      <p className="text-xs leading-snug" style={{ color: 'var(--text-3)' }}>{analisi.nota}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Due prospettive */}
        {showProspettive && (
          <ProspettiveCard
            poleA={{ src: poleA.src, analisi: poleA.analisi! }}
            poleB={{ src: poleB!.src, analisi: poleB!.analisi! }}
          />
        )}

        {/* Approfondimenti */}
        {result.approfondimenti?.length > 0 && (
          <div className="mt-6">
            <Approfondimenti items={result.approfondimenti} />
          </div>
        )}

      </div>
    </div>
  )
}
