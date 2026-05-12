import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{
        background: '#eab308', width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 6,
      }}>
        <span style={{ fontFamily: 'serif', fontSize: 22, fontWeight: 700, color: '#000' }}>V</span>
      </div>
    ),
    { ...size }
  )
}
