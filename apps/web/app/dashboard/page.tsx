// Dashboard a riquadri per categoria — stile Google News.
// 6 box (Esteri, Cronaca, Politica, Economia, Sport, Tecnologia), ognuno con 4 articoli (2x2).
// Le vecchie HeroSection / SecondaryGrid / FeedSection restano in repo (usate da _home/*) ma
// non sono piu' montate qui: la categorizzazione mescolata era la causa del problema segnalato.

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
              <h1 className="text-3xl font-bold leading-tight" style={{ color: 'var(--text)', fontFamily: 'var(--font-h)' }}>
                Le notizie di oggi
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
                Sei categorie, gli articoli piu recenti da tutte le fonti monitorate.
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
