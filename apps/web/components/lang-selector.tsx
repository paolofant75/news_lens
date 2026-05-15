'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SUPPORTED_LANGS } from '../lib/translate'

export default function LangSelector({ current }: { current: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const active = SUPPORTED_LANGS.find((l) => l.code === current) ?? SUPPORTED_LANGS[0]

  async function selectLang(code: string) {
    setOpen(false)
    await fetch('/api/lang', { method: 'POST', body: JSON.stringify({ lang: code }), headers: { 'Content-Type': 'application/json' } })
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition-colors"
      >
        <span className="text-gray-300 font-medium">{active.code.toUpperCase()}</span>
        <span className="text-gray-500 text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 min-w-36 overflow-hidden">
          {SUPPORTED_LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => selectLang(l.code)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-800 transition-colors text-left ${
                l.code === current ? 'text-blue-400' : 'text-gray-300'
              }`}
            >
              <span className="font-medium w-7">{l.code.toUpperCase()}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
