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

  const titleLines = wrapText(title, 55)
  const W = 800
  const titleH = titleLines.length * 38
  const rows = [
    { key: 'WHO',   val: fw.who },
    { key: 'WHAT',  val: fw.what },
    { key: 'WHERE', val: fw.where },
    { key: 'WHEN',  val: fw.when },
    { key: 'WHY',   val: fw.why },
  ]
  const rowHeight = 70
  const H = 100 + 30 + titleH + 20 + rows.length * rowHeight + 80

  const rowsHtml = rows.map((r, i) => {
    const y = 100 + 30 + titleH + 20 + i * rowHeight
    const valLines = wrapText(r.val || '–', 58)
    return `
      <rect x="40" y="${y}" width="${W - 80}" height="${rowHeight - 8}" rx="8" fill="${surface}" stroke="${border}" stroke-width="1"/>
      <text x="60" y="${y + 24}" font-family="Georgia, serif" font-size="11" font-weight="700" fill="${accent}" letter-spacing="2">${r.key}</text>
      ${valLines.slice(0, 2).map((line, li) =>
        `<text x="130" y="${y + 24 + li * 18}" font-family="Georgia, serif" font-size="13" fill="${textColor}">${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>`
      ).join('')}
    `
  }).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${bg}"/>

  <!-- Header bar -->
  <rect x="0" y="0" width="${W}" height="80" fill="${accent}"/>
  <text x="30" y="32" font-family="Georgia, serif" font-size="18" font-weight="700" fill="${isDark ? '#000' : '#fff'}" letter-spacing="1">⚖ VERITAS LENS</text>
  <text x="30" y="55" font-family="Georgia, serif" font-size="12" fill="${isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)'}">News, refracted · Five Ws Analysis</text>
  <text x="${W - 30}" y="46" text-anchor="end" font-family="Georgia, serif" font-size="11" fill="${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)'}">${new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}</text>

  <!-- Title -->
  <line x1="40" y1="100" x2="${W - 40}" y2="100" stroke="${border}" stroke-width="1"/>
  ${titleLines.map((line, i) =>
    `<text x="40" y="${132 + i * 38}" font-family="Georgia, serif" font-size="26" font-weight="700" fill="${textColor}">${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>`
  ).join('')}

  <!-- 5Ws rows -->
  ${rowsHtml}

  <!-- Footer -->
  <rect x="0" y="${H - 44}" width="${W}" height="44" fill="${surface}"/>
  <line x1="0" y1="${H - 44}" x2="${W}" y2="${H - 44}" stroke="${border}" stroke-width="1"/>
  <text x="30" y="${H - 16}" font-family="Georgia, serif" font-size="11" fill="${textSecondary}">Generato da Veritas Lens · news-lens-psi.vercel.app</text>
  <circle cx="${W - 30}" cy="${H - 22}" r="8" fill="${accent}"/>
  <text x="${W - 30}" y="${H - 18}" text-anchor="middle" font-family="Georgia" font-size="10" font-weight="bold" fill="${isDark ? '#000' : '#fff'}">V</text>
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
