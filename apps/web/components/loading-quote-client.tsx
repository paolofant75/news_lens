'use client'

import { useEffect, useState } from 'react'
import LoadingQuote from './loading-quote'

export default function LoadingQuoteClient() {
  const [palette, setPalette] = useState('noir')
  useEffect(() => {
    setPalette(document.documentElement.getAttribute('data-palette') ?? 'noir')
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <LoadingQuote palette={palette} />
    </div>
  )
}
