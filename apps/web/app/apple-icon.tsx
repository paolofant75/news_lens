import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{
        background: '#eab308', width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 36,
      }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 120, fontWeight: 700, color: '#000' }}>V</span>
      </div>
    ),
    { ...size }
  )
}
