type Source = { source: string; link: string; title: string }

type Props = {
  text: string
  sources: Source[]
}

// Renders article text with inline [N] citation markers as clickable superscripts
export default function ArticleWithCitations({ text, sources }: Props) {
  if (!text) return null

  // Split text on citation markers like [1], [2], [12]
  const parts = text.split(/(\[\d+\])/)

  return (
    <div className="leading-relaxed text-sm" style={{ color: 'var(--text)' }}>
      {parts.map((part, i) => {
        const match = part.match(/^\[(\d+)\]$/)
        if (match) {
          const idx = parseInt(match[1]) - 1
          const src = sources[idx]
          if (src) {
            return (
              <a
                key={i}
                href={src.link}
                target="_blank"
                rel="noopener noreferrer"
                title={`${src.source}: ${src.title}`}
                className="inline-flex items-center justify-center text-[9px] font-bold rounded px-1 mx-0.5 transition-opacity hover:opacity-70"
                style={{
                  background: 'var(--accent)22',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent)44',
                  verticalAlign: 'super',
                  lineHeight: '1.2',
                }}
              >
                {match[1]}
              </a>
            )
          }
          return <span key={i} className="text-xs opacity-40">{part}</span>
        }
        return (
          <span key={i} className="whitespace-pre-wrap">
            {part}
          </span>
        )
      })}
    </div>
  )
}
