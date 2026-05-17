// Dashboard MONDO — terminale geopolitico globale.
// 6 box per categoria (Esteri, Cronaca, Politica, Economia, Sport, Tecnologia), ognuno con 4 articoli (2x2).
// Il pool e' pre-filtrato via applyWorldFilter (lib/world-filter.ts): zero notizie regionali italiane,
// nazionali (ANSA Politica, Corriere) ammesse solo se globalImpactScore >= 6 (G7/Vaticano/elezioni
// tier-1/crisi finanziaria), boost ×1.4 per fonti Tier-1 (Reuters/BBC/AP/Guardian/AlJazeera/...).
// HeroSection / SecondaryGrid / FeedSection: orfane in app/_home/ (non piu' montate).

import { Suspense } from 'react'
import Link from 'next/link'
import Sidebar from '../../components/sidebar'
import CategoryBoxes from '../_home/CategoryBoxes'
import { GridSkeleton, SidebarSkeleton } from '../../components/skeletons'

export const revalidate = 120

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-4 py-8">

          {/* Intestazione pagina */}
          <header className="mb-6 flex items-end justify-between flex-wrap gap-3">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>
                Lens Veritas · Mondo
              </p>
              <h1 className="text-3xl font-bold leading-tight" style={{ color: 'var(--text)', fontFamily: 'var(--font-h)' }}>
                Tutto il mondo, le notizie principali
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
                Sei categorie filtrate per rilevanza geopolitica e affidabilita delle fonti.
              </p>
            </div>
            <Link
              href="/news"
              className="text-sm font-semibold hover:opacity-80"
              style={{ color: 'var(--accent)' }}
            >
              Sfoglia tutte le notizie →
            </Link>
          </header>

          {/* I 6 box per categoria — carica dietro suspense per non bloccare la sidebar */}
          <Suspense fallback={<GridSkeleton count={6} />}>
            <CategoryBoxes />
          </Suspense>

        </div>
      </main>
    </div>
  )
}
