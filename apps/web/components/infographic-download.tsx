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
  return lines.length > 0 ? lines : ['–']
}

function generateSVG(title: string, fw: FiveWs, palette: string): string {
  const isDark = palette !== 'bureau' && palette !== 'arctic'
  const bg        = isDark ? '#0a0a0a' : palette === 'bureau' ? '#f7f4ef' : '#ffffff'
  const surface   = isDark ? '#161616' : palette === 'bureau' ? '#edeae3' : '#f1f5f9'
  const accent    = isDark ? '#eab308' : palette === 'bureau' ? '#c0392b' : '#0f4c81'
  const textColor = isDark ? '#f1f1f1' : '#1a1a1a'
  const textSec   = isDark ? '#9ca3af' : '#5c4f42'
  const border    = isDark ? '#2a2a2a' : '#d4cfc7'
  const hdrText   = isDark ? '#000000' : '#ffffff'
  const hdrSub    = isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.75)'

  const W   = 1080
  const pad = 60
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Header: 160px, accent bar: 4px, gap: 36px
  const headerH = 200

  // Title block
  const titleLines = wrapText(title, 36)
  const titleLineH = 54
  const titleBlockH = titleLines.length * titleLineH
  const titleY = headerH + 36

  // 5W rows — dynamic height, ALL lines included
  const lineH = 26
  const cardPadTop = 82   // space above text (label + separator)
  const cardPadBot = 28
  const gap = 14

  const rows = [
    { key: 'WHO',    label: 'CHI',    val: fw.who   || '–' },
    { key: 'WHAT',   label: 'COSA',   val: fw.what  || '–' },
    { key: 'WHERE',  label: 'DOVE',   val: fw.where || '–' },
    { key: 'WHEN',   label: 'QUANDO', val: fw.when  || '–' },
    { key: 'WHY',    label: 'PERCHÉ', val: fw.why   || '–' },
  ].map((r) => {
    const lines = wrapText(r.val, 52)
    const cardH = cardPadTop + lines.length * lineH + cardPadBot
    return { ...r, lines, cardH }
  })

  const cardsTop = titleY + titleBlockH + 40
  let cardsHtml = ''
  let curY = cardsTop
  for (const r of rows) {
    cardsHtml += `
      <rect x="${pad}" y="${curY}" width="${W - pad * 2}" height="${r.cardH}" rx="16" fill="${surface}" stroke="${border}" stroke-width="1.5"/>
      <rect x="${pad}" y="${curY}" width="8" height="${r.cardH}" rx="4" fill="${accent}"/>
      <text x="${pad + 28}" y="${curY + 40}" font-family="Georgia, serif" font-size="12" font-weight="700" fill="${accent}" letter-spacing="3">${r.key} · ${r.label}</text>
      <line x1="${pad + 28}" y1="${curY + 53}" x2="${W - pad - 20}" y2="${curY + 53}" stroke="${border}" stroke-width="1"/>
      ${r.lines.map((line, li) =>
        `<text x="${pad + 28}" y="${curY + cardPadTop + li * lineH}" font-family="Georgia, serif" font-size="19" fill="${textColor}">${esc(line)}</text>`
      ).join('')}
    `
    curY += r.cardH + gap
  }

  const footerH = 100
  const H = curY + footerH

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${bg}"/>

  <!-- Header -->
  <rect x="0" y="0" width="${W}" height="160" fill="${accent}"/>
  <text x="${pad}" y="66" font-family="Georgia, serif" font-size="26" font-weight="700" fill="${hdrText}" letter-spacing="2">VERITAS LENS</text>
  <text x="${pad}" y="102" font-family="Georgia, serif" font-size="17" fill="${hdrSub}">News, refracted · Five Ws Analysis</text>
  <text x="${W - pad}" y="102" text-anchor="end" font-family="Georgia, serif" font-size="15" fill="${hdrSub}">${new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}</text>
  <rect x="0" y="160" width="${W}" height="4" fill="${accent}" opacity="0.3"/>

  <!-- Title -->
  <line x1="${pad}" y1="${titleY - 22}" x2="${W - pad}" y2="${titleY - 22}" stroke="${border}" stroke-width="1.5"/>
  ${titleLines.map((line, i) =>
    `<text x="${pad}" y="${titleY + i * titleLineH}" font-family="Georgia, serif" font-size="42" font-weight="700" fill="${textColor}">${esc(line)}</text>`
  ).join('')}
  <line x1="${pad}" y1="${titleY + titleBlockH + 18}" x2="${W - pad}" y2="${titleY + titleBlockH + 18}" stroke="${border}" stroke-width="1.5"/>

  <!-- 5W Cards -->
  ${cardsHtml}

  <!-- Footer -->
  <rect x="0" y="${H - footerH}" width="${W}" height="${footerH}" fill="${surface}"/>
  <line x1="0" y1="${H - footerH}" x2="${W}" y2="${H - footerH}" stroke="${border}" stroke-width="1.5"/>
  <text x="${pad}" y="${H - 54}" font-family="Georgia, serif" font-size="17" fill="${textSec}">Generato da Veritas Lens</text>
  <text x="${pad}" y="${H - 26}" font-family="Georgia, serif" font-size="13" fill="${textSec}" opacity="0.6">news-lens-psi.vercel.app</text>
  <circle cx="${W - pad}" cy="${H - 50}" r="26" fill="${accent}"/>
  <text x="${W - pad}" y="${H - 43}" text-anchor="middle" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="${hdrText}">V</text>
</svg>`
}

async function svgToJpeg(svgString: string, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return reject(new Error('no canvas'))
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.93))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('svg load failed')) }
    img.src = url
  })
}

export default function InfographicDownload({ title, five_ws, palette = 'noir' }: Props) {
  async function download() {
    const svg = generateSVG(title, five_ws, palette)
    // Measure real height from SVG
    const match = svg.match(/height="(\d+)"/)
    const h = match ? parseInt(match[1]) : 1920
    try {
      const jpeg = await svgToJpeg(svg, 1080, h)
      const a = document.createElement('a')
      a.href = jpeg
      a.download = `veritas-5W-${Date.now()}.jpg`
      a.click()
    } catch {
      // Fallback: download SVG
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `veritas-5W-${Date.now()}.svg`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <button
      onClick={download}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
      style={{ background: 'var(--bg-s)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
    >
      ⬇ Scarica JPEG
    </button>
  )
}
