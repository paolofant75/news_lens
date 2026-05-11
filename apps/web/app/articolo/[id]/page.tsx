import { cookies } from 'next/headers'
import { searchAllSources, analyzeWithVeritas, extractQueryFromUrl } from '../../../lib/veritas'
import type { SourceAnalysis } from '../../../lib/veritas'

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

export default async function ArticoloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const lang = cookieStore.get('nlv_lang')?.value ?? 'it'

  let query = ''
  try {
    const decoded = Buffer.from(id, 'base64url').toString('utf-8')
    query = decoded.startsWith('http') ? extractQueryFromUrl(decoded) : decoded
  } catch {
    query = id
  }

  const articles = await searchAllSources(query)
  const result = await analyzeWithVeritas(query, articles)

  // Unisci fonti con la loro analisi, filtra non pertinenti, ordina per score
  const sourcesWithAnalysis = result.sources
    .map((src, i) => ({
      src,
      analisi: result.analisi.find((a) => a.indice === i + 1 || a.fonte === src.source),
    }))
    .filter((x) => x.analisi && x.analisi.tipo_bias !== 'non pertinente' && x.analisi.completezza > 0)
    .sort((a, b) => scoreCard(b.analisi!) - scoreCard(a.analisi!))

  const totalSources = sourcesWithAnalysis.length
  const langLabel = lang !== 'en' ? ` (${lang.toUpperCase()})` : ''

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Back */}
        <a href="/news" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
          ← Torna alle notizie
        </a>

        {/* Query */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Analisi: <span className="text-blue-400">{query}</span></h1>
          <p className="text-sm text-gray-500">{totalSources} fonti analizzate da Veritas{langLabel}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* SINISTRA — Articolo consolidato */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-blue-800 bg-blue-950/20 p-7 h-full">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">📰</span>
                <div>
                  <h2 className="text-lg font-bold text-blue-300">Articolo Consolidato Veritas</h2>
                  <p className="text-xs text-blue-500">Sintesi imparziale · bias-free · {totalSources} fonti</p>
                </div>
              </div>
              <div className="text-gray-200 leading-relaxed whitespace-pre-wrap text-sm">
                {result.articolo_consolidato}
              </div>

              {/* Statistiche aggregate */}
              {sourcesWithAnalysis.length > 0 && (
                <div className="mt-6 pt-5 border-t border-blue-900 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-400">
                      {Math.round(sourcesWithAnalysis.reduce((s, x) => s + (x.analisi?.completezza ?? 0), 0) / sourcesWithAnalysis.length)}%
                    </p>
                    <p className="text-xs text-gray-500">Completezza media</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-400">
                      {Math.round(sourcesWithAnalysis.reduce((s, x) => s + (x.analisi?.bias ?? 0), 0) / sourcesWithAnalysis.length)}%
                    </p>
                    <p className="text-xs text-gray-500">Bias medio</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-400">{totalSources}</p>
                    <p className="text-xs text-gray-500">Fonti analizzate</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DESTRA — Fonti ordinate per score */}
          <div className="lg:col-span-2">
            <h2 className="text-base font-bold text-gray-300 mb-4">
              Fonti — dalla più completa e imparziale
            </h2>

            <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
              {sourcesWithAnalysis.map(({ src, analisi }, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-4 transition-all ${
                    i === 0
                      ? 'border-green-700 bg-green-950/20'
                      : 'border-gray-800 bg-gray-900'
                  }`}
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
      </div>
    </div>
  )
}
