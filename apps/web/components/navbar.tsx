import Link from 'next/link'
import { cookies } from 'next/headers'
import LangSelector from './lang-selector'

export default async function Navbar() {
  const cookieStore = await cookies()
  const lang = cookieStore.get('nlv_lang')?.value ?? 'it'

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-sm">NLV</span>
          <span className="hidden sm:inline text-white">News Lens Veritas</span>
        </Link>

        <div className="flex items-center gap-5">
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/news" className="text-gray-400 hover:text-white transition-colors">
              Notizie
            </Link>
            <Link href="/veritas" className="text-blue-500 hover:text-blue-300 font-semibold transition-colors">
              ⚖️ Veritas
            </Link>
            <Link href="/mappa" className="text-gray-400 hover:text-white transition-colors">
              🗺️ Mappa
            </Link>
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              Dashboard
            </Link>
          </nav>
          <LangSelector current={lang} />
        </div>
      </div>
    </header>
  )
}
