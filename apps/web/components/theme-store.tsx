'use client'

import { useEffect } from 'react'

export default function ThemeStore({ palette, font }: { palette: string; font: string }) {
  useEffect(() => {
    document.documentElement.setAttribute('data-palette', palette)
    document.documentElement.setAttribute('data-font', font)
  }, [palette, font])
  return null
}
