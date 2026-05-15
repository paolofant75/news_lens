import { cookies } from 'next/headers'
import { searchAllSources, analyzeWithVeritas, extractQueryFromUrl, cleanSearchQuery } from '../../../lib/veritas'
import { decodeArticleId } from '../../../lib/encode'
import type { SourceAnalysis } from '../../../lib/veritas'
import { fetchGlobalStats, getRelevantStats } from '../../../lib/stats'
import type { GlobalStat } from '../../../lib/stats'
import FiveWsCard from '../../../components/five-ws-card'
import Approfondimenti from '../../../components/approfondimenti'
import AudioReader from '../../../components/audio-reader'
import ArticleWithCitations from '../../../components/article-with-citations'
import ProspettiveCard from '../../../components/prospettive-card'
import ConsentReopenButton from '../../../components/consent-reopen-button'

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

  let query = ''
  let searchQuery = ''
  try {
    const decoded = decodeArticleId(id)
    query = decoded.startsWith('http') ? extractQueryFromUrl(decoded) : decoded
    searchQuery = cleanSearchQuery(query)
  } catch {
    query = id
    searchQuery = id
  }

  if (!aiConsent) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="max-w-xl text-center px-6">
          <div className="text-5xl mb-6">✦</div>
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
    searchAllSources(searchQuery),
    fetchGlobalStats(),
  ])

  if (articles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="max-w-xl text-center px-6">
          <div className="text-5xl mb-6">🔍</div>
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
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80"
              style={{ background: 'var(--accent)' }}>
              Cerca su Veritas ⚖️
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
          <h1 className="text-2xl font-bold text-white mb-1">Analisi: <span className="text-blue-400">{query}</span></h1>
          <p className="text-sm text-gray-500">
            {totalSources} fonti analizzate da Veritas{langLabel}
            {searchQuery !== query && (
              <span className="ml-2 opacity-60">(ricerca: &ldquo;{searchQuery}&rdquo;)</span>
            )}
          </p>
        </div>

        {/* Five Ws Card */}
        {result.five_ws?.who && (
          <div className="mb-8">
            <FiveWsCard five_ws={result.five_ws} title={query} palette={palette} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">

          {/* SINISTRA — Statistiche correlate */}
          <div className="lg:col-span-1 order-last lg:order-first flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            <p className="hidden lg:block text-xs font-semibold uppercase tracking-widest mb-1 shrink-0" style={{ color: 'var(--text-3)' }}>
              Statistiche
            </p>
            {relevantStats.map((stat) => (
              <div key={stat.id} className="rounded-xl p-3 shrink-0 lg:shrink w-52 lg:w-auto"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
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

          {/* CENTRO — Articolo consolidato */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl p-7 h-full" style={{ background: 'var(--bg-card)', border: '1px solid var(--accent)' }}>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">📰</span>
                <div>
                  <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-h)', color: 'var(--accent)' }}>Articolo Consolidato Veritas</h2>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                    Sintesi su cui {totalSources} {totalSources === 1 ? 'fonte converge' : 'fonti convergono'} · Le fonti di ogni affermazione sono indicate come pillole sotto ogni paragrafo
                  </p>
                  <p className="text-[10px] mt-1 px-1.5 py-0.5 rounded inline-flex items-center gap-1" style={{ background: 'var(--bg-s)', color: 'var(--text-3)', border: '1px solid var(--border)' }}>
                    ✦ Generato da AI (Claude) · EU AI Act art. 50
                  </p>
                  <div className="mt-2">
                    <AudioReader text={result.articolo_consolidato} lang={lang} />
                  </div>
                </div>
              </div>
              {result.articolo_consolidato ? (
                <ArticleWithCitations text={result.articolo_consolidato} sources={result.sources} />
              ) : (
                <p className="text-sm italic" style={{ color: 'var(--text-3)' }}>
                  Analisi Veritas non disponibile per questa notizia — le fonti trovate non contengono contenuto sufficiente per produrre un articolo consolidato.
                </p>
              )}

              {/* Statistiche aggregate */}
              {sourcesWithAnalysis.length > 0 && (
                <div className="mt-6 pt-5 grid grid-cols-3 gap-4 text-center" style={{ borderTop: '1px solid var(--border)' }}>
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

          {/* DESTRA — Fonti ordinate per score */}
          <div className="lg:col-span-2 order-first lg:order-last">
            <h2 className="text-base font-bold mb-4" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
              Fonti — dalla più completa e imparziale
            </h2>

            <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
              {sourcesWithAnalysis.map(({ src, analisi }, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 transition-all"
                  style={i === 0
                    ? { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.5)' }
                    : { background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  {/* Badge posizione */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {i === 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-green-800 text-green-200">✓ Migliore</span>}
                      <span className="font-semibold text-sm text-white">{src.source}</span>
                    </div>
                    <a href={src.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                      Apri ↗
                    </a>
                  </div>

                  {/* Titolo */}
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">{src.title}</p>

                  {/* Barre */}
                  <div className="space-y-2 mb-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Completezza</span>
                        <span className="text-green-400 font-medium">{analisi!.completezza}%</span>
                      </div>
                      <BiasBar value={analisi!.completezza} color="bg-green-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Bias</span>
                        <span className={`font-medium ${analisi!.bias <= 20 ? 'text-green-400' : analisi!.bias <= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {analisi!.bias}%
                        </span>
                      </div>
                      <BiasBar value={analisi!.bias} color={biasColor(analisi!.bias)} />
                    </div>
                  </div>

                  {/* Badge tipo + nota */}
                  <div className="flex items-start gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${badgeClass(analisi!.tipo_bias)}`}>
                      {analisi!.tipo_bias}
                    </span>
                    <p className="text-xs text-gray-500 leading-snug">{analisi!.nota}</p>
                  </div>
                </div>
              ))}

              {/* Fonti senza analisi */}
              {result.sources
                .filter((src) => !result.analisi.find((a) => a.fonte === src.source))
                .map((src, i) => (
                  <div key={`na-${i}`} className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{src.source}</span>
                      <a href={src.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">Apri ↗</a>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">{src.title}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Due prospettive — prima degli approfondimenti: confrontare le letture è più importante */}
        {showProspettive && (
          <ProspettiveCard
            poleA={{ src: poleA.src, analisi: poleA.analisi! }}
            poleB={{ src: poleB!.src, analisi: poleB!.analisi! }}
          />
        )}

        {/* Approfondimenti */}
        {result.approfondimenti?.length > 0 && (
          <div className="mt-2 px-0">
            <Approfondimenti items={result.approfondimenti} />
          </div>
        )}
      </div>
    </div>
  )
}
