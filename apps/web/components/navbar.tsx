import Link from 'next/link'
import { cookies } from 'next/headers'
import LangSelector from './lang-selector'
import TweaksPanel from './tweaks-panel'

export default async function Navbar() {
  const cookieStore = await cookies()
  const lang = cookieStore.get('nlv_lang')?.value ?? 'it'
  const palette = cookieStore.get('nlv_palette')?.value ?? 'noir'
  const font = cookieStore.get('nlv_font')?.value ?? 'geist'

  return (
    <header
      className="sticky top-0 z-50 h-14 flex items-center"
      style={{ background: 'var(--bg-s)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'var(--accent)' }}
          >
            V
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold leading-tight" style={{ color: 'var(--text)', fontFamily: 'var(--font-h)' }}>
              Veritas Lens
            </div>
            <div className="text-xs leading-tight" style={{ color: 'var(--text-3)' }}>News, refracted</div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/news" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-2)' }}>
            Notizie
          </Link>
          <Link href="/veritas" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: 'var(--accent)' }}>
            Veritas
          </Link>
          <Link href="/mappa" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-2)' }}>
            Mappa
          </Link>
          <Link href="/dashboard" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-2)' }}>
            Dashboard
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <LangSelector current={lang} />
          <TweaksPanel palette={palette} font={font} />
        </div>
      </div>
    </header>
  )
}
