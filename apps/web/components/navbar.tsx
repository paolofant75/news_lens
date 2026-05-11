'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const CATEGORIES = [
  { label: 'Ultime notizie', slug: 'breaking', color: 'text-red-400' },
  { label: 'Conflitti e crisi', slug: 'conflitti', color: 'text-orange-400' },
  { label: 'Politica', slug: 'politica', color: 'text-blue-400' },
  { label: 'Economia', slug: 'economia', color: 'text-green-400' },
  { label: 'Tecnologia e AI', slug: 'tecnologia', color: 'text-purple-400' },
  { label: 'Scienza', slug: 'scienza', color: 'text-cyan-400' },
  { label: 'Salute', slug: 'salute', color: 'text-teal-400' },
  { label: 'Ambiente', slug: 'ambiente', color: 'text-emerald-400' },
  { label: 'Sport', slug: 'sport', color: 'text-yellow-400' },
  { label: 'Cultura', slug: 'cultura', color: 'text-pink-400' },
  { label: 'Cronaca', slug: 'cronaca', color: 'text-gray-400' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-gray-800">
      {/* Barra principale */}
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-sm">NLV</span>
          <span className="hidden sm:inline text-white">News Lens Veritas</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/news"
            className={`transition-colors hover:text-white ${pathname === '/news' ? 'text-white' : 'text-gray-400'}`}
          >
            Notizie
          </Link>
          <Link
            href="/mappa"
            className={`transition-colors hover:text-white ${pathname === '/mappa' ? 'text-white' : 'text-gray-400'}`}
          >
            Mappa
          </Link>
          <Link
            href="/dashboard"
            className={`transition-colors hover:text-white ${pathname === '/dashboard' ? 'text-white' : 'text-gray-400'}`}
          >
            Dashboard
          </Link>
        </nav>
      </div>

      {/* Barra categorie */}
      <div className="border-t border-gray-900 overflow-x-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 py-1 min-w-max">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/news?categoria=${cat.slug}`}
              className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors hover:bg-gray-800 ${cat.color}`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
