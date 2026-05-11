'use client'

import { useState, useEffect } from 'react'

type Props = {
  onChange?: (layout: 'grid' | 'list') => void
}

export default function LayoutToggle({ onChange }: Props) {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const saved = localStorage.getItem('nlv_layout') as 'grid' | 'list' | null
    if (saved) { setLayout(saved); onChange?.(saved) }
  }, [])

  function set(l: 'grid' | 'list') {
    setLayout(l)
    localStorage.setItem('nlv_layout', l)
    onChange?.(l)
  }

  return (
    <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <button
        onClick={() => set('grid')}
        title="Griglia"
        className="p-1.5 rounded transition-all"
        style={layout === 'grid' ? { background: 'var(--accent)', color: '#fff' } : { color: 'var(--text-3)' }}
      >
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <rect x="0" y="0" width="7" height="7" rx="1"/>
          <rect x="9" y="0" width="7" height="7" rx="1"/>
          <rect x="0" y="9" width="7" height="7" rx="1"/>
          <rect x="9" y="9" width="7" height="7" rx="1"/>
        </svg>
      </button>
      <button
        onClick={() => set('list')}
        title="Lista"
        className="p-1.5 rounded transition-all"
        style={layout === 'list' ? { background: 'var(--accent)', color: '#fff' } : { color: 'var(--text-3)' }}
      >
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <rect x="0" y="1" width="16" height="3" rx="1"/>
          <rect x="0" y="6" width="16" height="3" rx="1"/>
          <rect x="0" y="11" width="16" height="3" rx="1"/>
        </svg>
      </button>
    </div>
  )
}
