'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-sm">NLV</span>
          <span className="hidden sm:inline text-white">News Lens Veritas</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/news" className={`transition-colors hover:text-white ${pathname?.startsWith('/news') ? 'text-white' : 'text-gray-400'}`}>
            Notizie
          </Link>
          <Link href="/veritas" className={`transition-colors font-semibold ${pathname === '/veritas' ? 'text-blue-400' : 'text-blue-500 hover:text-blue-300'}`}>
            ⚖️ Veritas
          </Link>
          <Link href="/mappa" className={`transition-colors hover:text-white ${pathname === '/mappa' ? 'text-white' : 'text-gray-400'}`}>
            🗺️ Mappa
          </Link>
          <Link href="/dashboard" className={`transition-colors hover:text-white ${pathname === '/dashboard' ? 'text-white' : 'text-gray-400'}`}>
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  )
}
