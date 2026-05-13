import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{
        background: '#ffffff', width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 6,
        borderRadius: 40,
      }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 110, fontWeight: 700, color: '#cc0000', lineHeight: 1 }}>V</span>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 600, color: '#cc0000', letterSpacing: 4 }}>LENS</span>
      </div>
    ),
    { ...size }
  )
}
