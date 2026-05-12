'use client'

import { useEffect } from 'react'

export default function ThemeStore({ palette, font }: { palette: string; font: string }) {
  useEffect(() => {
    document.documentElement.setAttribute('data-palette', palette)
    document.documentElement.setAttribute('data-font', font)
    // Ripristina colore accent personalizzato se salvato
    const savedAccent = localStorage.getItem('nlv_accent')
    if (savedAccent) {
      document.documentElement.style.setProperty('--accent', savedAccent)
    }
  }, [palette, font])
  return null
}
