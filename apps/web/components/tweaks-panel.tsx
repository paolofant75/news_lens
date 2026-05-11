'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PALETTES = [
  {
    id: 'noir',
    label: 'Noir',
    colors: ['#0a0a0a', '#eab308', '#3b82f6', '#f1f1f1'],
  },
  {
    id: 'bureau',
    label: 'Bureau',
    colors: ['#f7f4ef', '#c0392b', '#e67e22', '#1a1a1a'],
  },
  {
    id: 'arctic',
    label: 'Arctic',
    colors: ['#ffffff', '#0f4c81', '#f59e0b', '#0f172a'],
  },
]

const FONTS = [
  { id: 'geist',   label: 'Geist',   sub: 'Geist Sans · Mono' },
  { id: 'tribune', label: 'Tribune', sub: 'Instrument · Geist' },
  { id: 'atlas',   label: 'Atlas',   sub: 'Newsreader · Space Grotesk' },
  { id: 'beacon',  label: 'Beacon',  sub: 'Source Serif · IBM Plex' },
]

const LAYOUTS = ['Magazine', 'Grid', 'Wire']
const DENSITIES = ['Comfy', 'Dense']

type Props = {
  palette: string
  font: string
}

export default function TweaksPanel({ palette, font }: Props) {
  const [open, setOpen] = useState(false)
  const [currentPalette, setCurrentPalette] = useState(palette)
  const [currentFont, setCurrentFont] = useState(font)
  const [layout, setLayout] = useState('Grid')
  const [density, setDensity] = useState('Comfy')
  const router = useRouter()

  async function applyTheme(newPalette: string, newFont: string) {
    document.documentElement.setAttribute('data-palette', newPalette)
    document.documentElement.setAttribute('data-font', newFont)
    await fetch('/api/lang', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ palette: newPalette, font: newFont }),
    }).catch(() => {})
    // Save to localStorage as fallback
    localStorage.setItem('nlv_palette', newPalette)
    localStorage.setItem('nlv_font', newFont)
  }

  function selectPalette(id: string) {
    setCurrentPalette(id)
    applyTheme(id, currentFont)
  }

  function selectFont(id: string) {
    setCurrentFont(id)
    applyTheme(currentPalette, id)
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        title="Tweaks"
        style={{ background: 'var(--bg-s)', border: '1px solid var(--border)', color: 'var(--text)' }}
        className="p-2 rounded-lg hover:opacity-80 transition-opacity text-sm"
      >
        ⚙
      </button>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}

      {/* Panel */}
      {open && (
        <div
          className="fixed top-14 right-4 z-50 w-64 rounded-xl shadow-2xl p-5 space-y-5"
          style={{
            background: 'var(--bg-s)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">Tweaks</span>
            <button onClick={() => setOpen(false)} style={{ color: 'var(--text-3)' }} className="hover:opacity-80 text-lg leading-none">✕</button>
          </div>

          {/* Palette */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Palette</p>
            <div className="flex gap-2">
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectPalette(p.id)}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className="w-14 h-10 rounded-lg overflow-hidden grid grid-cols-2 grid-rows-2"
                    style={{ outline: currentPalette === p.id ? '2px solid var(--accent)' : '2px solid transparent', outlineOffset: '2px' }}
                  >
                    {p.colors.map((c, i) => (
                      <div key={i} style={{ background: c }} />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: currentPalette === p.id ? 'var(--accent)' : 'var(--text-3)' }}>
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Font */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Tipo di font</p>
            <div className="grid grid-cols-2 gap-1.5">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => selectFont(f.id)}
                  className="px-3 py-2 rounded-lg text-left transition-colors"
                  style={{
                    background: currentFont === f.id ? 'var(--accent)' : 'var(--bg-card)',
                    color: currentFont === f.id ? '#fff' : 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="text-xs font-semibold">{f.label}</div>
                  <div className="text-xs opacity-60 truncate">{f.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Layout feed</p>
            <div className="flex gap-1.5">
              {LAYOUTS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLayout(l)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background: layout === l ? 'var(--accent)' : 'var(--bg-card)',
                    color: layout === l ? '#fff' : 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Density */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Densità</p>
            <div className="flex gap-1.5">
              {DENSITIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDensity(d)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background: density === d ? 'var(--accent)' : 'var(--bg-card)',
                    color: density === d ? '#fff' : 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
