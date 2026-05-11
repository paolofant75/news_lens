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
