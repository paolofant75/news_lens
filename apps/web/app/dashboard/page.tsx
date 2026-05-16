// Dashboard "feed" — ex-homepage. Spostata da `/` per fare spazio alla nuova landing editoriale.
// Contenuto identico al vecchio app/page.tsx: niente regressioni.

import { Suspense } from 'react'
import Link from 'next/link'
import Sidebar from '../../components/sidebar'
import HeroSection from '../_home/HeroSection'
import SecondaryGrid from '../_home/SecondaryGrid'
import FeedSection from '../_home/FeedSection'
import { FeaturedSkeleton, GridSkeleton, SidebarSkeleton } from '../../components/skeletons'

export const revalidate = 120

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Sidebar — carica in parallelo, non blocca il main */}
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>

      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Hero (trending + featured + stats carousel) */}
          <Suspense fallback={<FeaturedSkeleton />}>
            <HeroSection />
          </Suspense>

          {/* Griglia secondaria */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
                Ultime notizie
              </p>
              <Link href="/news" className="text-xs hover:opacity-80" style={{ color: 'var(--accent)' }}>
                Vedi tutte →
              </Link>
            </div>
            <Suspense fallback={<GridSkeleton count={4} />}>
              <SecondaryGrid />
            </Suspense>
          </div>

          {/* Feed completo — il più lento, carica per ultimo */}
          <Suspense fallback={<GridSkeleton count={9} />}>
            <FeedSection />
          </Suspense>

        </div>
      </main>
    </div>
  )
}
