'use client'
import dynamic from 'next/dynamic'

type GlobePoint = {
  id: string
  lat: number
  lng: number
  label: string
  code: string
  title: string
  originalTitle: string
  source: string
  link: string
  category: string
  color: string
  size: number
  reliability: number
  isPulsing: boolean
}

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

export default function GlobeWrapper({ points }: { points: GlobePoint[] }) {
  return <GlobeClient points={points} />
}
