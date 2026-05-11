'use client'

import type { FiveWs } from '../lib/veritas'

type Props = {
  title: string
  five_ws: FiveWs
  palette?: string
}

function wrapText(text: string, maxLen: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    if ((line + word).length > maxLen) {
      if (line) lines.push(line.trim())
      line = word + ' '
    } else {
      line += word + ' '
    }
  }
  if (line.trim()) lines.push(line.trim())
  return lines
}

function generateSVG(title: string, fw: FiveWs, palette: string): string {
  const isDark = palette !== 'bureau' && palette !== 'arctic'
  const bg = isDark ? '#0a0a0a' : palette === 'bureau' ? '#f7f4ef' : '#ffffff'
  const surface = isDark ? '#161616' : palette === 'bureau' ? '#edeae3' : '#f1f5f9'
  const accent = isDark ? '#eab308' : palette === 'bureau' ? '#c0392b' : '#0f4c81'
  const textColor = isDark ? '#f1f1f1' : '#1a1a1a'
  const textSecondary = isDark ? '#9ca3af' : '#5c4f42'
  const border = isDark ? '#2a2a2a' : '#d4cfc7'
  const headerText = isDark ? '#000000' : '#ffffff'
  const headerTextSub = isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.75)'

  const W = 1080
  const H = 1920
  const pad = 60

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Title: font 44, ~36 chars/line
  const titleLines = wrapText(title, 36)
  const titleY = 220
  const titleBlockH = titleLines.length * 54

  // Cards: 5 cards filling space below title to footer
  const cardsTop = titleY + titleBlockH + 60
  const cardsBottom = H - 120
  const cardH = Math.floor((cardsBottom - cardsTop) / 5) - 10
  const lineH = 28

  const rows = [
    { key: 'WHO',   label: 'CHI',   val: fw.who },
    { key: 'WHAT',  label: 'COSA',  val: fw.what },
    { key: 'WHERE', label: 'DOVE',  val: fw.where },
    { key: 'WHEN',  label: 'QUANDO',val: fw.when },
    { key: 'WHY',   label: 'PERCHÉ',val: fw.why },
  ]

  const cardsHtml = rows.map((r, i) => {
    const y = cardsTop + i * (cardH + 10)
    const valLines = wrapText(r.val || '–', 52)
    const maxLines = Math.floor((cardH - 70) / lineH)
    return `
      <rect x="${pad}" y="${y}" width="${W - pad * 2}" height="${cardH}" rx="16" fill="${surface}" stroke="${border}" stroke-width="1.5"/>
      <rect x="${pad}" y="${y}" width="8" height="${cardH}" rx="4" fill="${accent}"/>
      <text x="${pad + 28}" y="${y + 42}" font-family="Georgia, serif" font-size="13" font-weight="700" fill="${accent}" letter-spacing="3">${r.key} · ${r.label}</text>
      <line x1="${pad + 28}" y1="${y + 55}" x2="${W - pad - 20}" y2="${y + 55}" stroke="${border}" stroke-width="1"/>
      ${valLines.slice(0, maxLines).map((line, li) =>
        `<text x="${pad + 28}" y="${y + 80 + li * lineH}" font-family="Georgia, serif" font-size="20" fill="${textColor}">${esc(line)}</text>`
      ).join('')}
    `
  }).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${bg}"/>

  <!-- Header -->
  <rect x="0" y="0" width="${W}" height="160" fill="${accent}"/>
  <text x="${pad}" y="68" font-family="Georgia, serif" font-size="28" font-weight="700" fill="${headerText}" letter-spacing="2">⚖ VERITAS LENS</text>
  <text x="${pad}" y="104" font-family="Georgia, serif" font-size="18" fill="${headerTextSub}">News, refracted · Five Ws Analysis</text>
  <text x="${W - pad}" y="104" text-anchor="end" font-family="Georgia, serif" font-size="16" fill="${headerTextSub}">${new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}</text>

  <!-- Accent line -->
  <rect x="0" y="160" width="${W}" height="4" fill="${accent}" opacity="0.3"/>

  <!-- Title -->
  <line x1="${pad}" y1="${titleY - 24}" x2="${W - pad}" y2="${titleY - 24}" stroke="${border}" stroke-width="1.5"/>
  ${titleLines.map((line, i) =>
    `<text x="${pad}" y="${titleY + i * 54}" font-family="Georgia, serif" font-size="44" font-weight="700" fill="${textColor}">${esc(line)}</text>`
  ).join('')}
  <line x1="${pad}" y1="${titleY + titleBlockH + 20}" x2="${W - pad}" y2="${titleY + titleBlockH + 20}" stroke="${border}" stroke-width="1.5"/>

  <!-- 5W Cards -->
  ${cardsHtml}

  <!-- Footer -->
  <rect x="0" y="${H - 100}" width="${W}" height="100" fill="${surface}"/>
  <line x1="0" y1="${H - 100}" x2="${W}" y2="${H - 100}" stroke="${border}" stroke-width="1.5"/>
  <text x="${pad}" y="${H - 52}" font-family="Georgia, serif" font-size="18" fill="${textSecondary}">Generato da Veritas Lens</text>
  <text x="${pad}" y="${H - 24}" font-family="Georgia, serif" font-size="14" fill="${textSecondary}" opacity="0.6">news-lens-psi.vercel.app</text>
  <circle cx="${W - pad}" cy="${H - 50}" r="28" fill="${accent}"/>
  <text x="${W - pad}" y="${H - 42}" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="${headerText}">V</text>
</svg>`
}

export default function InfographicDownload({ title, five_ws, palette = 'noir' }: Props) {
  function download() {
    const svg = generateSVG(title, five_ws, palette)
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `veritas-5W-${Date.now()}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={download}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
      style={{ background: 'var(--bg-s)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
    >
      ⬇ Scarica infografica
    </button>
  )
}
