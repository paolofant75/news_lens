import Link from 'next/link'
import { fetchArticles } from '../lib/rss'
import CountryPanel from './country-panel'
import TaxonomyTree from './taxonomy-tree'
import { buildCounts } from '../lib/taxonomy'
import { IconNewspaper, IconScale, IconGlobe, IconUser, IconActivity } from './icons'

const NAV_ITEMS = [
  { href: '/news',    Icon: IconNewspaper, label: 'Notizie',       badge: null },
  { href: '/veritas', Icon: IconScale,     label: 'Veritas',       badge: 'AI' },
  { href: '/mappa',   Icon: IconGlobe,     label: 'Mappa Globale', badge: null },
  { href: '/stats',   Icon: IconActivity,  label: 'Statistiche',   badge: null },
  { href: '/profilo', Icon: IconUser,      label: 'Profilo',       badge: null },
]

export default async function Sidebar() {
  const articles = await fetchArticles()
  const counts = buildCounts(articles)

  return (
    <aside
      className="hidden lg:flex flex-col w-60 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto"
      style={{ background: 'var(--bg-s)', borderRight: '1px solid var(--border)' }}
    >
      <div className="p-3 space-y-4">

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
                  <item.Icon size={15} />
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

        {/* Tassonomia */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2 px-2" style={{ color: 'var(--text-3)' }}>
            Categorie
          </p>
          <TaxonomyTree counts={counts} />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto p-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-3)' }}>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
          <span>Live · {articles.length} storie</span>
        </div>
        <p className="text-[10px] mt-1 opacity-30" style={{ color: 'var(--text-3)' }}>v2.1</p>
      </div>
    </aside>
  )
}
