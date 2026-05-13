'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Stat = {
  id: string
  label: string
  value: string
  unit: string
  trend?: 'up' | 'down' | 'stable'
  category: string
  linkedCategory: string
  source: string
  curiosity: string
}

const TREND_ICON: Record<string, string> = { up: '↑', down: '↓', stable: '→' }
const TREND_COLOR: Record<string, string> = { up: '#22c55e', down: '#ef4444', stable: '#94a3b8' }
const INTERVAL = 4000

export default function HeroStatsCarousel({
  stats,
  accent,
}: {
  stats: Stat[]
  accent: string
}) {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (stats.length <= 1) return
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent((c) => (c + 1) % stats.length)
        setVisible(true)
      }, 300)
    }, INTERVAL)
    return () => clearInterval(timer)
  }, [stats.length])

  if (!stats.length) return null

  const stat = stats[current]

  return (
    <div className="absolute inset-0 flex flex-col justify-between p-6">

      {/* Badge categoria in alto */}
      <div>
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
          style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44` }}
        >
          {stat.category}
        </span>
      </div>

      {/* Statistica centrale — fade transition */}
      <Link
        href={`/news?categoria=${stat.linkedCategory}`}
        className="flex-1 flex flex-col items-center justify-center gap-2 cursor-pointer group"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        <p
          className="text-5xl font-bold tabular-nums text-center leading-none"
          style={{ color: accent, fontFamily: 'var(--font-h)' }}
        >
          {stat.value}
          {stat.trend && (
            <span className="text-xl ml-2" style={{ color: TREND_COLOR[stat.trend ?? 'stable'] }}>
              {TREND_ICON[stat.trend ?? 'stable']}
            </span>
          )}
        </p>
        <p className="text-xs font-medium text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {stat.unit}
        </p>
        <p className="text-xs text-center leading-snug px-2 mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {stat.label}
        </p>
        <p className="text-[10px] text-center leading-snug px-2 mt-1 line-clamp-2 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {stat.curiosity}
        </p>
        <span className="text-[10px] mt-1 opacity-50 group-hover:opacity-90 transition-opacity" style={{ color: accent }}>
          Vedi notizie →
        </span>
      </Link>

      {/* Dots + live badge in basso */}
      <div className="flex flex-col gap-2">
        {/* Dots */}
        {stats.length > 1 && (
          <div className="flex items-center justify-center gap-1.5">
            {stats.map((_, i) => (
              <button
                key={i}
                onClick={() => { setVisible(false); setTimeout(() => { setCurrent(i); setVisible(true) }, 300) }}
                className="rounded-full transition-all"
                style={{
                  width: i === current ? 16 : 6,
                  height: 6,
                  background: i === current ? accent : 'rgba(255,255,255,0.25)',
                }}
              />
            ))}
          </div>
        )}

        {/* Fonte statistica — cambia con la slide */}
        <div className="flex items-center gap-2"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
          <span className="text-[10px] font-medium truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Fonte: {stat.source}
          </span>
        </div>
      </div>

    </div>
  )
}
