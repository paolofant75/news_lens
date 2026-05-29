'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { TAXONOMY } from '../lib/taxonomy'
import { IconNewspaper, IconScale, IconGlobe, IconUser, IconChevronRight, IconChevronDown, IconZap, IconGlobe2, IconCpu, IconTrending, IconFlask, IconLayers, IconEye } from './icons'

const NAV = [
  { href: '/news',    Icon: IconNewspaper, label: 'Notizie' },
  { href: '/veritas', Icon: IconScale,     label: 'Veritas' },
  { href: '/mappa',   Icon: IconGlobe,     label: 'Mappa'   },
]

const NODE_ICONS: Record<string, React.ReactNode> = {
  breaking:      <IconZap size={16} />,
  geopolitics:   <IconGlobe2 size={16} />,
  ai_tech:       <IconCpu size={16} />,
  economy:       <IconTrending size={16} />,
  health_science:<IconFlask size={16} />,
  narratives:    <IconLayers size={16} />,
  osint:         <IconEye size={16} />,
}

export default function MobileNav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <>
      {/* Bottom tab bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
        style={{ background: 'var(--bg-s)', borderTop: '1px solid var(--border)', height: 56 }}
      >
        {NAV.map(({ href, Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-opacity"
              style={{ color: active ? 'var(--accent)' : 'var(--text-3)' }}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}

        {/* Categorie tab */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-opacity"
          style={{ color: menuOpen ? 'var(--accent)' : 'var(--text-3)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          <span className="text-[10px] font-medium">Categorie</span>
        </button>
      </nav>

      {/* Slide-up category panel */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />

          {/* Panel */}
          <div
            className="lg:hidden fixed bottom-14 left-0 right-0 z-50 rounded-t-2xl overflow-y-auto"
            style={{ background: 'var(--bg-s)', border: '1px solid var(--border)', maxHeight: '70vh' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
            </div>

            <div className="px-4 pb-6 space-y-1">
              {/* Tutte le categorie */}
              <Link
                href="/news"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                <span>Tutte le categorie</span>
              </Link>

              <div className="my-2" style={{ borderBottom: '1px solid var(--border)' }} />

              {/* Top-level taxonomy nodes */}
              {TAXONOMY.map((node) => {
                const isOpen = expanded === node.id
                const hasChildren = node.children && node.children.length > 0
                return (
                  <div key={node.id}>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/news?taxonomy=${node.id}`}
                        onClick={() => setMenuOpen(false)}
                        className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-80"
                        style={{ color: 'var(--text)' }}
                      >
                        <span className="opacity-60">{NODE_ICONS[node.id]}</span>
                        <span className="font-medium">{node.label}</span>
                      </Link>
                      {hasChildren && (
                        <button
                          onClick={() => setExpanded(isOpen ? null : node.id)}
                          className="px-2 py-2 rounded-lg opacity-50 hover:opacity-80"
                          style={{ color: 'var(--text-2)' }}
                        >
                          {isOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                        </button>
                      )}
                    </div>

                    {/* Children — only level-2, no grandchildren */}
                    {isOpen && hasChildren && (
                      <div className="ml-8 mt-0.5 space-y-0.5">
                        {node.children!.map((child) => (
                          <Link
                            key={child.id}
                            href={`/news?taxonomy=${child.id}`}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                            style={{ color: 'var(--text-2)' }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full opacity-40" style={{ background: 'currentColor', flexShrink: 0 }} />
                            <span>{child.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Spacer so content isn't hidden behind bottom bar */}
      <div className="lg:hidden h-14" />
    </>
  )
}
