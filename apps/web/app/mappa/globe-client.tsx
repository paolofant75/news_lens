'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

type GlobePoint = {
  lat: number
  lng: number
  label: string
  code: string
  title: string
  source: string
  link: string
  category: string
  color: string
  size: number
  reliability: number
}

type Props = { points: GlobePoint[] }

export default function GlobeClient({ points }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<any>(null)
  const [selected, setSelected] = useState<GlobePoint | null>(null)
  const [loaded, setLoaded] = useState(false)

  const initGlobe = useCallback(async () => {
    if (!containerRef.current) return
    const { default: Globe } = await import('globe.gl')

    const width = containerRef.current.clientWidth
    const height = Math.min(580, window.innerHeight * 0.7)

    const globe = Globe({ animateIn: true })(containerRef.current)
      .width(width)
      .height(height)
      .backgroundColor('#000000')
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .atmosphereColor('#1e40af')
      .atmosphereAltitude(0.15)
      // Punti notizie
      .pointsData(points)
      .pointLat('lat')
      .pointLng('lng')
      .pointColor('color')
      .pointAltitude(0.04)
      .pointRadius('size')
      .pointResolution(8)
      .pointLabel((d: any) => `
        <div style="
          background: rgba(0,0,0,0.85);
          border: 1px solid ${d.color};
          padding: 10px 14px;
          border-radius: 8px;
          max-width: 260px;
          font-family: sans-serif;
        ">
          <div style="font-size:11px;color:${d.color};font-weight:600;margin-bottom:4px;">${d.label} · ${d.category}</div>
          <div style="font-size:12px;color:#e5e7eb;line-height:1.4;">${d.title.slice(0, 120)}${d.title.length > 120 ? '…' : ''}</div>
          <div style="font-size:10px;color:#6b7280;margin-top:6px;">${d.source} · ★ ${d.reliability}</div>
        </div>
      `)
      .onPointClick((point: any) => setSelected(point as GlobePoint))

    // Auto-rotazione
    globe.controls().autoRotate = true
    globe.controls().autoRotateSpeed = 0.6
    globe.controls().enableDamping = true

    // Zoom iniziale
    globe.pointOfView({ altitude: 2.2 })

    globeRef.current = globe
    setLoaded(true)
  }, [points])

  useEffect(() => {
    initGlobe()
    return () => {
      if (globeRef.current?._destructor) globeRef.current._destructor()
    }
  }, [initGlobe])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-3">
        <h1 className="text-2xl font-bold mb-1">🌍 Notizie Globali</h1>
        <p className="text-sm text-gray-400">
          Ruota il globo · Trascina per esplorare · Clicca su un punto per leggere la notizia
        </p>
      </div>

      {/* Legenda categorie */}
      <div className="max-w-7xl mx-auto px-4 pb-4 flex flex-wrap gap-2">
        {[
          { cat: 'conflitti', color: '#f97316', label: 'Conflitti' },
          { cat: 'politica', color: '#3b82f6', label: 'Politica' },
          { cat: 'economia', color: '#10b981', label: 'Economia' },
          { cat: 'tecnologia', color: '#a855f7', label: 'Tecnologia' },
          { cat: 'scienza', color: '#06b6d4', label: 'Scienza' },
          { cat: 'salute', color: '#14b8a6', label: 'Salute' },
          { cat: 'breaking', color: '#ef4444', label: 'Breaking' },
          { cat: 'cronaca', color: '#94a3b8', label: 'Cronaca' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>

      {/* Globo */}
      <div className="relative">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-gray-500 text-sm animate-pulse">Caricamento globo...</div>
          </div>
        )}
        <div ref={containerRef} className="w-full" />
      </div>

      {/* Card notizia selezionata */}
      {selected && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
          <div
            className="rounded-2xl border p-5 shadow-2xl backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.92)', borderColor: selected.color }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: selected.color }} />
                  <span className="text-xs font-semibold" style={{ color: selected.color }}>
                    {selected.label} · {selected.category}
                  </span>
                  <span className="text-xs text-gray-500">{selected.source} · ★ {selected.reliability}</span>
                </div>
                <p className="text-white font-semibold leading-snug mb-3">{selected.title}</p>
                <div className="flex gap-3">
                  <a
                    href={`/articolo/${Buffer.from(selected.title).toString('base64url')}`}
                    className="text-xs px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    ⚖️ Analisi Veritas
                  </a>
                  <a
                    href={selected.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                  >
                    Apri originale ↗
                  </a>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-white text-xl leading-none flex-shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
