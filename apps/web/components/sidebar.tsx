import Link from 'next/link'
import { fetchArticles } from '../lib/rss'
import CountryPanel from './country-panel'

const NAV_ITEMS = [
  { href: '/news',      icon: '📰', label: 'Notizie',       badge: null },
  { href: '/veritas',   icon: '⚖️', label: 'Veritas',       badge: 'AI' },
  { href: '/mappa',     icon: '🌍', label: 'Mappa Globale', badge: null },
  { href: '/dashboard', icon: '📡', label: 'API Status',    badge: null },
]

const CATEGORIES = [
  { slug: 'breaking',   icon: '🔴', label: 'Breaking' },
  { slug: 'conflitti',  icon: '⚔️', label: 'Conflitti' },
  { slug: 'politica',   icon: '🏛️', label: 'Politica' },
  { slug: 'economia',   icon: '📈', label: 'Economia' },
  { slug: 'tecnologia', icon: '🤖', label: 'Tecnologia' },
  { slug: 'scienza',    icon: '🔬', label: 'Scienza' },
  { slug: 'salute',     icon: '🏥', label: 'Salute' },
  { slug: 'ambiente',   icon: '🌿', label: 'Ambiente' },
  { slug: 'sport',      icon: '⚽', label: 'Sport' },
  { slug: 'cultura',    icon: '🎭', label: 'Cultura' },
]

export default async function Sidebar() {
  const articles = await fetchArticles()
  const catCounts = CATEGORIES.reduce((acc, c) => {
    acc[c.slug] = articles.filter((a) => a.category === c.slug).length
    return acc
  }, {} as Record<string, number>)

  return (
    <aside
      className="hidden lg:flex flex-col w-56 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto"
      style={{ background: 'var(--bg-s)', borderRight: '1px solid var(--border)' }}
    >
      <div className="p-4 space-y-5">
        {/* Workspace */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2 px-2" style={{ color: 'var(--text-3)' }}>
            Workspace
          </p>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all hover:opacity-80"
                style={{ color: 'var(--text-2)' }}
              >
                <span className="flex items-center gap-2.5">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                {item.badge && (
                  <span className="text-xs px-1.5 py-0.5 rounded font-bold text-white" style={{ background: 'var(--accent)' }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Cerca per paese */}
        <div>
          <CountryPanel />
        </div>

        {/* Categorie */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2 px-2" style={{ color: 'var(--text-3)' }}>
            Categorie
          </p>
          <nav className="space-y-0.5">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/news?categoria=${cat.slug}`}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-80"
                style={{ color: 'var(--text-2)' }}
              >
                <span className="flex items-center gap-2.5">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </span>
                <span className="text-xs tabular-nums" style={{ color: 'var(--text-3)' }}>
                  {catCounts[cat.slug] ?? 0}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto p-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-3)' }}>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
          <span>Live · {articles.length} storie</span>
        </div>
      </div>
    </aside>
  )
}
