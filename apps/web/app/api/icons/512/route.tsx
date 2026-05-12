import { ImageResponse } from 'next/og'

export async function GET() {
  return new ImageResponse(
    (
      <div style={{
        background: '#0d0d0d', width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 10,
      }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 300, fontWeight: 700, color: '#ff0000', lineHeight: 1 }}>V</span>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 56, fontWeight: 400, color: 'rgba(255,255,255,0.45)', letterSpacing: 14 }}>LENS</span>
      </div>
    ),
    { width: 512, height: 512 }
  )
}
