'use client'

import { useState, useRef } from 'react'

type State = 'idle' | 'loading' | 'playing'

export default function AudioReader({ text, lang = 'it' }: { text: string; lang?: string }) {
  const [state, setState] = useState<State>('idle')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const blobUrlRef = useRef<string | null>(null)

  async function toggle() {
    if (state === 'playing') {
      audioRef.current?.pause()
      setState('idle')
      return
    }
    if (state === 'loading') return

    setState('loading')
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang }),
      })
      if (!res.ok) throw new Error('TTS request failed')

      const blob = await res.blob()
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
      const url = URL.createObjectURL(blob)
      blobUrlRef.current = url

      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => setState('idle')
      audio.onerror = () => setState('idle')
      await audio.play()
      setState('playing')
    } catch (e) {
      console.error('[AudioReader]', e)
      setState('idle')
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={state === 'loading'}
      title={state === 'playing' ? 'Ferma lettura' : 'Ascolta articolo'}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
      style={{
        background: state === 'playing' ? 'var(--accent)' : 'var(--bg-s)',
        border: '1px solid var(--border)',
        color: state === 'playing' ? '#000' : 'var(--text-2)',
      }}
    >
      {state === 'loading' ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      ) : state === 'playing' ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2"/>
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>
      )}
      {state === 'loading' ? 'Carico...' : state === 'playing' ? 'Stop' : 'Ascolta'}
    </button>
  )
}
