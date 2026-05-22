// Dashboard a riquadri stile Google News: 6 box per categoria, ognuno con 4 articoli (2x2).
// Vista MONDO: tutto il pool passa per applyWorldFilter prima del grouping
// -> niente cronaca regionale italiana, niente sport locali, niente affari Quebec.
// Notizie nazionali (ANSA Politica, Corriere Esteri, ecc.) entrano solo se globalImpactScore >= 6.

import Link from 'next/link'
import { cookies } from 'next/headers'
import { fetchArticles, type Article } from '../../lib/rss'
import { translateBatch } from '../../lib/translate'
import { sortByPreferredLang } from '../../lib/lang-priority'
import { applyWorldFilter } from '../../lib/world-filter'
import {
  IconGlobe,
  IconNewspaper,
  IconLandmark,
  IconTrending,
  IconBall,
  IconCpu,
} from '../../components/icons'

type IconComp = (p: { size?: number; className?: string }) => React.ReactElement
type BoxDef = { slug: string; label: string; Icon: IconComp }

// Ordine richiesto dall'utente: Esteri -> Cronaca -> Politica -> Economia -> Sport -> Tecnologia
const BOXES: BoxDef[] = [
  { slug: 'esteri',     label: 'Esteri',     Icon: IconGlobe },
  { slug: 'cronaca',    label: 'Cronaca',    Icon: IconNewspaper },
  { slug: 'politica',   label: 'Politica',   Icon: IconLandmark },
  { slug: 'economia',   label: 'Economia',   Icon: IconTrending },
  { slug: 'sport',      label: 'Sport',      Icon: IconBall },
  { slug: 'tecnologia', label: 'Tecnologia', Icon: IconCpu },
]

const ARTICLES_PER_BOX = 4

function timeAgoSrv(dateStr: string): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  if (Number.isNaN(diff)) return ''
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'ora'
  if (min < 60) return `${min}m fa`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h fa`
  return `${Math.floor(h / 24)}g fa`
}

export default async function CategoryBoxes() {
  const cookieStore = await cookies()
  const lang = cookieStore.get('nlv_lang')?.value ?? 'it'

  const allRaw = await fetchArticles()
  // Filtro Mondo: applicato a monte. Tutto il pool che entra nei box e' world-eligible.
  // Cap soft 12/paese (piu' permissivo del default 8 perche' qui poi splittiamo per categoria).
  // applyWorldFilter e' async per supportare la classificazione AI (USE_AI_CLASSIFIER=true);
  // in modalita' Legacy l'await e' praticamente gratis (microtask boundary).
  const all = await applyWorldFilter(allRaw, { capPerCountry: 12 })

  // Indicizza per categoria, prendendo i 4 piu recenti per ognuna nella lingua preferita
  const byCategory = new Map<string, Article[]>()
  for (const box of BOXES) {
    const filtered = all.filter((a) => a.category === box.slug)
    const ordered = sortByPreferredLang(filtered, lang)
    byCategory.set(box.slug, ordered.slice(0, ARTICLES_PER_BOX))
  }

  // Una sola traduzione batch di tutti i 24 titoli (6 box * 4 articoli), con cache Redis condivisa
  const flat: Article[] = []
  const offsets = new Map<string, [number, number]>()  // slug -> [start, end)
  for (const box of BOXES) {
    const items = byCategory.get(box.slug) ?? []
    const start = flat.length
    flat.push(...items)
    offsets.set(box.slug, [start, flat.length])
  }
  const translated = await translateBatch(
    flat.map((a) => ({ title: a.title, summary: a.summary, source: a.source })),
    lang
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {BOXES.map((box) => {
        const [start, end] = offsets.get(box.slug) ?? [0, 0]
        const items = flat.slice(start, end).map((a, i) => ({
          ...a,
          displayTitle: translated[start + i]?.title ?? a.title,
        }))
        const total = all.filter((a) => a.category === box.slug).length
        return (
          <section
            key={box.slug}
            className="rounded-2xl overflow-hidden flex flex-col"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {/* Header del box: categoria + count + "Vedi tutto" */}
            <header className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <box.Icon size={16} className="opacity-70" />
                <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text)', fontFamily: 'var(--font-h)' }}>
                  {box.label}
                </h2>
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-3)' }}>· {total}</span>
              </div>
              <Link
                href={`/news?categoria=${box.slug}`}
                className="text-[11px] font-semibold hover:opacity-80"
                style={{ color: 'var(--accent)' }}
              >
                Vedi tutto →
              </Link>
            </header>

            {/* Griglia 2x2 dei 4 articoli del box */}
            {items.length === 0 ? (
              <div className="p-6 text-xs text-center" style={{ color: 'var(--text-3)' }}>
                Nessuna notizia in questa categoria al momento.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-px" style={{ background: 'var(--border)' }}>
                {items.map((a) => (
                  <Link
                    key={a.id}
                    href={`/articolo/${a.id}`}
                    className="block p-3 hover:opacity-90 transition-opacity"
                    style={{ background: 'var(--bg-card)' }}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] font-semibold truncate" style={{ color: 'var(--accent)' }}>
                        {a.source}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>
                        · {timeAgoSrv(a.pubDate)}
                      </span>
                    </div>
                    <p
                      className="text-xs font-semibold leading-snug line-clamp-3"
                      style={{ color: 'var(--text)', fontFamily: 'var(--font-h)' }}
                    >
                      {a.displayTitle}
                    </p>
                  </Link>
                ))}
                {/* Riempi celle vuote per mantenere 2x2 anche con meno di 4 articoli */}
                {Array.from({ length: Math.max(0, ARTICLES_PER_BOX - items.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-3" style={{ background: 'var(--bg-card)' }} />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
