'use client'

import { useState, useRef } from 'react'

export default function AudioReader({ text, lang = 'it' }: { text: string; lang?: string }) {
  const [playing, setPlaying] = useState(false)
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)

  function toggle() {
    if (!('speechSynthesis' in window)) return

    if (playing) {
      window.speechSynthesis.cancel()
      setPlaying(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang === 'it' ? 'it-IT' : lang === 'en' ? 'en-US' : lang === 'fr' ? 'fr-FR' : lang === 'de' ? 'de-DE' : lang === 'es' ? 'es-ES' : 'it-IT'
    utterance.rate = 0.95
    utterance.onend = () => setPlaying(false)
    utterance.onerror = () => setPlaying(false)
    utterRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setPlaying(true)
  }

  return (
    <button
      onClick={toggle}
      title={playing ? 'Ferma lettura' : 'Ascolta articolo'}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
      style={{
        background: playing ? 'var(--accent)' : 'var(--bg-s)',
        border: '1px solid var(--border)',
        color: playing ? '#000' : 'var(--text-2)',
      }}
    >
      {playing ? (
        // Stop icon
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2"/>
        </svg>
      ) : (
        // Play/speaker icon
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>
      )}
      {playing ? 'Stop' : 'Ascolta'}
    </button>
  )
}
