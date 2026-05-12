'use client'

import { useEffect } from 'react'

export default function ThemeStore({ palette, font }: { palette: string; font: string }) {
  useEffect(() => {
    document.documentElement.setAttribute('data-palette', palette)
    document.documentElement.setAttribute('data-font', font)
    // Ripristina colore accent per la palette attiva
    const defaultAccent = palette === 'bureau' ? '#2e7eff' : '#ff0000'
    const savedAccent = localStorage.getItem(`nlv_accent_${palette}`) ?? defaultAccent
    document.documentElement.style.setProperty('--accent', savedAccent)
  }, [palette, font])
  return null
}
