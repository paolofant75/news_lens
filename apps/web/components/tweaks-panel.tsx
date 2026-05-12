'use client'

import { useState, useRef } from 'react'

const PALETTES = [
  { id: 'noir',   label: 'Noir',   bg: '#0a0a0a', text: '#f1f1f1' },
  { id: 'bureau', label: 'Bureau', bg: '#f7f4ef', text: '#1a1a1a' },
]

const ACCENT_PRESETS = [
  { label: 'Giallo',   color: '#eab308' },
  { label: 'Rosso',    color: '#e63946' },
  { label: 'Arancio',  color: '#f97316' },
  { label: 'Blu',      color: '#3b82f6' },
  { label: 'Ciano',    color: '#06b6d4' },
  { label: 'Verde',    color: '#22c55e' },
  { label: 'Viola',    color: '#a855f7' },
  { label: 'Rosa',     color: '#ec4899' },
]

const FONTS = [
  { id: 'geist', label: 'Geist',  sub: 'Sans-serif moderno' },
  { id: 'atlas', label: 'Atlas',  sub: 'Newsreader · editoriale' },
]

async function saveCookies(palette: string, font: string) {
  await fetch('/api/lang', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ palette, font }),
  }).catch(() => {})
}

type Props = { palette: string; font: string }

export default function TweaksPanel({ palette, font }: Props) {
  const [open, setOpen]               = useState(false)
  const [currentPalette, setPalette]  = useState(palette)
  const [currentFont, setFont]        = useState(font)
  const defaultAccent = (id: string) => id === 'bureau' ? '#c0392b' : '#eab308'

  const [currentAccent, setAccent] = useState(() => {
    if (typeof window === 'undefined') return '#eab308'
    return localStorage.getItem(`nlv_accent_${palette}`) ?? defaultAccent(palette)
  })
  const colorRef = useRef<HTMLInputElement>(null)

  function applyAccent(color: string, pal = currentPalette) {
    document.documentElement.style.setProperty('--accent', color)
    localStorage.setItem(`nlv_accent_${pal}`, color)
    setAccent(color)
  }

  function selectPalette(id: string) {
    setPalette(id)
    document.documentElement.setAttribute('data-palette', id)
    localStorage.setItem('nlv_palette', id)
    // Ripristina il colore accent salvato per questa palette
    const saved = localStorage.getItem(`nlv_accent_${id}`) ?? defaultAccent(id)
    applyAccent(saved, id)
    saveCookies(id, currentFont)
  }

  function selectFont(id: string) {
    setFont(id)
    document.documentElement.setAttribute('data-font', id)
    localStorage.setItem('nlv_font', id)
    saveCookies(currentPalette, id)
  }

  function resetAccent() {
    applyAccent(defaultAccent(currentPalette))
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Tweaks"
        className="p-2 rounded-lg hover:opacity-80 transition-opacity text-sm"
        style={{ background: 'var(--bg-s)', border: '1px solid var(--border)', color: 'var(--text)' }}
      >
        ⚙
      </button>

      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}

      {open && (
        <div
          className="fixed top-14 right-4 z-50 w-72 rounded-xl shadow-2xl p-5 space-y-5"
          style={{ background: 'var(--bg-s)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">Personalizza</span>
            <button onClick={() => setOpen(false)} className="hover:opacity-80 text-lg leading-none" style={{ color: 'var(--text-3)' }}>✕</button>
          </div>

          {/* Sfondo */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Sfondo</p>
            <div className="flex gap-3">
              {PALETTES.map((p) => (
                <button key={p.id} onClick={() => selectPalette(p.id)} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-16 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      background: p.bg, color: p.text,
                      outline: currentPalette === p.id ? `2px solid ${currentAccent}` : '2px solid transparent',
                      outlineOffset: 2,
                    }}
                  >
                    Aa
                  </div>
                  <span className="text-xs" style={{ color: currentPalette === p.id ? 'var(--accent)' : 'var(--text-3)' }}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Colore accent */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>Colore accent</p>
              <button onClick={resetAccent} className="text-xs hover:opacity-70" style={{ color: 'var(--text-3)' }}>Reset</button>
            </div>
            {/* Swatches preset */}
            <div className="grid grid-cols-8 gap-1.5 mb-3">
              {ACCENT_PRESETS.map((a) => (
                <button
                  key={a.color}
                  onClick={() => applyAccent(a.color)}
                  title={a.label}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: a.color,
                    outline: currentAccent === a.color ? '2px solid var(--text)' : '2px solid transparent',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
            {/* Custom color picker */}
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg cursor-pointer flex-shrink-0 transition-transform hover:scale-110"
                style={{ background: currentAccent }}
                onClick={() => colorRef.current?.click()}
              />
              <div className="flex-1">
                <p className="text-xs" style={{ color: 'var(--text-2)' }}>Colore personalizzato</p>
                <p className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>{currentAccent}</p>
              </div>
              <input
                ref={colorRef}
                type="color"
                value={currentAccent}
                onChange={(e) => applyAccent(e.target.value)}
                className="w-0 h-0 opacity-0 absolute"
              />
            </div>
          </div>

          {/* Font */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Font</p>
            <div className="grid grid-cols-2 gap-1.5">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => selectFont(f.id)}
                  className="px-3 py-2 rounded-lg text-left transition-colors"
                  style={{
                    background: currentFont === f.id ? currentAccent : 'var(--bg-card)',
                    color: currentFont === f.id ? '#000' : 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="text-xs font-semibold">{f.label}</div>
                  <div className="text-xs opacity-60 truncate">{f.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg p-3 text-xs" style={{ background: 'var(--bg-card)', border: `1px solid ${currentAccent}` }}>
            <span style={{ color: currentAccent }}>● </span>
            <span style={{ color: 'var(--text)' }}>Anteprima combinazione attuale</span>
          </div>
        </div>
      )}
    </>
  )
}
