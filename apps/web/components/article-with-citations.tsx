import React from 'react'

type Source = { source: string; link: string; title: string }

type Props = {
  text: string
  sources: Source[]
}

// Matches: numbers with units, acronyms (2-6 caps), multi-word Title Case sequences
const HIGHLIGHT_RE = /(\b\d+(?:[.,]\d+)?\s*(?:%|€|\$|£|mld|mln|miliardi|milioni|mila|km|kg|GW|MW|anni|ore|giorni|persone|mesi)?\b|\b[A-Z]{2,6}\b|[A-ZÀÈÉÌÒÙÁ][a-zàèéìòùáâêîôûäëïöü]+(?:\s+[A-ZÀÈÉÌÒÙÁ][a-zàèéìòùáâêîôûäëïöü]+)+)/

function renderHighlighted(text: string): React.ReactNode[] {
  const parts = text.split(HIGHLIGHT_RE)
  let count = 0
  return parts.map((part, i) => {
    if (i % 2 === 1 && count < 8) {
      count++
      return (
        <span key={i} style={{ background: '#FAC775', color: '#412402', padding: '1px 4px', borderRadius: '3px' }}>
          {part}
        </span>
      )
    }
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}

export default function ArticleWithCitations({ text, sources }: Props) {
  if (!text) return null

  const paragraphs = text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 20)

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {paragraphs.map((para, paraIdx) => {
        // Extract [N] citation markers → source pills
        const citationMatches = [...para.matchAll(/\[(\d+)\]/g)]
        const sourceIndices = [...new Set(citationMatches.map(m => parseInt(m[1]) - 1))]
        const citedSources = sourceIndices.map(idx => sources[idx]).filter(Boolean)

        // Clean text: remove [N] markers and collapse extra spaces
        const clean = para.replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').trim()
        if (!clean) return null

        // Drop cap: first character
        const dropLetter = clean[0]

        // Incipit: next 2 words (first 2 space-separated tokens after the drop cap letter)
        const afterDrop = clean.slice(1).trimStart()
        const tokens = afterDrop.split(' ')
        const incipit = tokens.slice(0, 2).join(' ')
        const body = tokens.slice(2).join(' ')

        return (
          <div key={paraIdx} style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '16px', lineHeight: '1.85', color: 'var(--text)', marginBottom: 0 }}>
              {/* Capolettera */}
              <span style={{
                float: 'left',
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '80px',
                lineHeight: '0.88',
                padding: '4px 14px 0 0',
                fontWeight: 500,
                color: 'var(--text)',
              }}>
                {dropLetter}
              </span>
              {/* Incipit */}
              <span style={{
                fontSize: '19px',
                fontWeight: 500,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                color: 'var(--text)',
              }}>
                {incipit}{' '}
              </span>
              {/* Body with auto-highlights */}
              {renderHighlighted(body)}
            </p>

            {/* Source pills */}
            {citedSources.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '1.25rem', clear: 'both' }}>
                {citedSources.map((src, i) => (
                  <a key={i} href={src.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <span style={{
                      fontSize: '12px',
                      padding: '3px 9px',
                      borderRadius: '999px',
                      background: '#F1EFE8',
                      color: '#5F5E5A',
                      border: '0.5px solid rgba(0,0,0,0.15)',
                      cursor: 'pointer',
                    }}>
                      {src.source}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
