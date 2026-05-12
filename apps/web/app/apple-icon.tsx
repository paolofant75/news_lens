import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{
        background: '#0d0d0d', width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 40,
      }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 110, fontWeight: 700, color: '#ff0000' }}>V</span>
      </div>
    ),
    { ...size }
  )
}
