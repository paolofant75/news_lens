'use client'

import {
  IconSearch, IconBarChart, IconGlobe, IconSettings, IconLightbulb,
  IconCompass, IconScale,
} from './icons'

type IconComp = (p: { size?: number; className?: string }) => React.ReactElement

const ICONS: IconComp[] = [IconSearch, IconBarChart, IconGlobe, IconSettings, IconLightbulb]

export default function Approfondimenti({ items }: { items: string[] }) {
  if (!items || items.length === 0) return null

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--text)' }}>
        <IconCompass size={18} />
        <h2 className="text-base font-bold" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
          Approfondisci
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--bg-s)', color: 'var(--text-3)' }}>
          AI
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {items.map((title, i) => {
          const Icon = ICONS[i % ICONS.length]
          return (
            <a
              key={i}
              href={`/veritas?q=${encodeURIComponent(title)}`}
              className="group flex flex-col gap-2 p-4 rounded-xl transition-all hover:opacity-80 hover:scale-[1.02]"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <span style={{ color: 'var(--text-2)' }}><Icon size={20} /></span>
              <p className="text-xs font-medium leading-snug" style={{ color: 'var(--text)' }}>
                {title}
              </p>
              <span className="inline-flex items-center gap-1 text-xs mt-auto" style={{ color: 'var(--accent)' }}>
                Analizza <IconScale size={11} />
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
