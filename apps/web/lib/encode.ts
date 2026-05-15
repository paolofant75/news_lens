// Stable ID 10-char base64url derivato dal link dell'articolo
// (stesso link -> stesso id, deterministico e URL-friendly)
export function articleId(link: string): string {
  if (typeof window === 'undefined') {
    // Server: crypto.createHash('md5')
    // Inline require evita di sporcare l'import lista del file
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto') as typeof import('crypto')
    return crypto.createHash('md5').update(link).digest('base64url').slice(0, 10)
  }
  // Browser fallback: hash semplice (non usato in pratica, gli ID sono server-generated)
  let h = 0
  for (let i = 0; i < link.length; i++) h = ((h << 5) - h + link.charCodeAt(i)) | 0
  const buf = new Uint8Array(8)
  for (let i = 0; i < 8; i++) buf[i] = (h >> (i * 4)) & 0xff
  const binary = Array.from(buf).map((b) => String.fromCharCode(b)).join('')
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '').slice(0, 10)
}

export function encodeArticleId(title: string): string {
  if (typeof window === 'undefined') {
    return Buffer.from(title).toString('base64url')
  }
  // Browser: TextEncoder → base64url
  const bytes = new TextEncoder().encode(title)
  const binary = Array.from(bytes).map((b) => String.fromCharCode(b)).join('')
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export function decodeArticleId(id: string): string {
  if (typeof window === 'undefined') {
    return Buffer.from(id, 'base64url').toString('utf-8')
  }
  const base64 = id.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  const bytes = new Uint8Array(Array.from(binary).map((c) => c.charCodeAt(0)))
  return new TextDecoder().decode(bytes)
}
