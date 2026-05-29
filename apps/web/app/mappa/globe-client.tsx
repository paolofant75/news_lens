'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { IconScale, IconClose } from '../../components/icons'

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
      .atmosphereColor('#1a3a6b')
      .atmosphereAltitude(0.18)
      // Static points
      .pointsData(points)
      .pointLat('lat')
      .pointLng('lng')
      .pointColor('color')
      .pointAltitude(0.04)
      .pointRadius('size')
      .pointResolution(12)
      .pointLabel((d: any) => `
        <div style="
          background: rgba(4,4,16,0.92);
          border: 1px solid ${d.color};
          border-left: 3px solid ${d.color};
          padding: 10px 14px;
          border-radius: 6px;
          max-width: 280px;
          font-family: 'SF Mono', 'Fira Code', monospace, sans-serif;
          box-shadow: 0 4px 24px rgba(0,0,0,0.6);
        ">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
            <span style="width:7px;height:7px;border-radius:50%;background:${d.color};flex-shrink:0;"></span>
            <span style="font-size:10px;color:${d.color};font-weight:700;text-transform:uppercase;letter-spacing:1px;">${d.label}</span>
            <span style="font-size:9px;color:#4b5563;margin-left:auto;">rel ${d.reliability}</span>
          </div>
          <div style="font-size:12px;color:#e5e7eb;line-height:1.5;margin-bottom:5px;">${d.title.slice(0, 130)}${d.title.length > 130 ? '…' : ''}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:9px;color:#6b7280;">${d.source}</span>
            <span style="font-size:9px;padding:2px 6px;border-radius:3px;background:${d.color}22;color:${d.color};">${d.category}</span>
          </div>
        </div>
      `)
      .onPointClick((point: any) => setSelected(point as GlobePoint))
      // Pulsing rings for breaking/high-priority
      .ringsData(points.filter((p) => p.isPulsing))
      .ringLat('lat')
      .ringLng('lng')
      .ringColor((d: any) => (t: number) => d.color + Math.round((1 - t) * 160).toString(16).padStart(2, '0'))
      .ringMaxRadius(3.0)
      .ringPropagationSpeed(1.5)
      .ringRepeatPeriod(1400)

    globe.controls().autoRotate = true
    globe.controls().autoRotateSpeed = 0.4
    globe.controls().enableDamping = true
    globe.pointOfView({ altitude: 2.0 })

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
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-3">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-h)' }}>Notizie Globali</h1>
          <span className="text-xs px-2 py-1 rounded font-mono" style={{ background: 'var(--bg-card)', color: 'var(--text-3)', border: '1px solid var(--border)' }}>
            {points.length} segnali attivi
          </span>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>
          Ruota · Trascina · Clicca su un punto per l&apos;analisi Veritas
        </p>
      </div>

      {/* Legenda */}
      <div className="max-w-7xl mx-auto px-4 pb-4 flex flex-wrap gap-3">
        {[
          { color: '#ef4444', label: 'Breaking' },
          { color: '#f97316', label: 'Conflitti' },
          { color: '#3b82f6', label: 'Politica' },
          { color: '#10b981', label: 'Economia' },
          { color: '#a855f7', label: 'Tecnologia' },
          { color: '#06b6d4', label: 'Scienza' },
          { color: '#14b8a6', label: 'Salute' },
          { color: '#22c55e', label: 'Ambiente' },
          { color: '#94a3b8', label: 'Cronaca' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-3)' }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs ml-2" style={{ color: 'var(--text-3)' }}>
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ boxShadow: '0 0 4px #fff' }} />
          Pulsante = Breaking / Alta affidabilità
        </span>
      </div>

      {/* Globe */}
      <div className="relative">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-xs font-mono animate-pulse" style={{ color: 'var(--text-3)' }}>
              Caricamento intelligence map...
            </span>
          </div>
        )}
        <div ref={containerRef} className="w-full" />
      </div>

      {/* Selected article card */}
      {selected && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
          <div
            className="rounded-xl border p-5 shadow-2xl backdrop-blur-sm"
            style={{ background: 'rgba(4,4,16,0.95)', borderColor: selected.color, borderLeftWidth: 3 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selected.color }} />
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: selected.color }}>
                    {selected.label}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ background: selected.color + '22', color: selected.color }}>
                    {selected.category}
                  </span>
                  <span className="text-xs ml-auto" style={{ color: 'var(--text-3)' }}>{selected.source} · rel {selected.reliability}</span>
                </div>
                <p className="font-semibold leading-snug mb-3" style={{ color: 'var(--text)' }}>{selected.title}</p>
                <div className="flex gap-3">
                  <a
                    href={`/articolo/${selected.id}`}
                    className="inline-flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80"
                    style={{ background: 'var(--accent)', color: '#000' }}
                  >
                    <IconScale size={14} /> Analisi Veritas
                  </a>
                  <a
                    href={selected.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-4 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                    style={{ background: 'var(--bg-card)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                  >
                    Originale ↗
                  </a>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="flex-shrink-0 transition-opacity hover:opacity-70"
                style={{ color: 'var(--text-3)' }}
                aria-label="Chiudi"
              >
                <IconClose size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
