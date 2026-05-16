// Icone lineari ispirate a Lucide (stroke 1.5, currentColor, monocromatiche).
// Implementate inline come SVG per evitare dipendenze esterne.

type IconProps = { size?: number; className?: string }

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

// Step 01 — Aggregazione (icona "layers")
export function IconAggregation({ size = 28, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 3 2 8l10 5 10-5-10-5z" />
      <path d="M2 16l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  )
}

// Step 02 — Scoring (icona "scala/bilancia")
export function IconScale({ size = 28, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 3v18" />
      <path d="M5 21h14" />
      <path d="M5 8h14" />
      <path d="M2 14 5 8l3 6a3 3 0 0 1-6 0z" />
      <path d="M16 14l3-6 3 6a3 3 0 0 1-6 0z" />
    </svg>
  )
}

// Step 03 — Multi-agente AI (icona "rete neurale")
export function IconAgents({ size = 28, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="5" cy="6" r="2" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="12" r="2" />
      <circle cx="12" cy="6" r="1.5" />
      <circle cx="12" cy="18" r="1.5" />
      <path d="M7 6h3.5M7 18h3.5M13.5 6l3.7 5M13.5 18l3.7-5" />
    </svg>
  )
}

// Step 04 — Consolidamento (icona "doc check")
export function IconConsolidate({ size = 28, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  )
}

// Feature Globe
export function IconGlobe({ size = 28, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a13 13 0 0 1 0 18a13 13 0 0 1 0-18z" />
    </svg>
  )
}

// Feature Veritas (lente + check)
export function IconVeritas({ size = 28, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
      <path d="m8 11 2 2 4-4" />
    </svg>
  )
}

// Feature Intelligence (search + sparkle)
export function IconIntelligence({ size = 28, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <path d="m5.6 5.6 2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

// Freccia "vai" (per CTA inline)
export function IconArrow({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
