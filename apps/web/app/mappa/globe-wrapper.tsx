'use client'
import dynamic from 'next/dynamic'
import type { CountryPoint } from '../../lib/geo-extract'

const GlobeClient = dynamic(() => import('./globe-client'), {
  ssr: false,
  loading: () => (
    <div
      className="h-[580px] flex items-center justify-center"
      style={{ background: 'var(--bg)', color: 'var(--text-3)' }}
    >
      <span className="font-mono text-xs animate-pulse">CARICAMENTO GLOBO 3D…</span>
    </div>
  ),
})

export default function GlobeWrapper({ points }: { points: CountryPoint[] }) {
  return <GlobeClient points={points} />
}
