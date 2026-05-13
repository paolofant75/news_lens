import { ImageResponse } from 'next/og'

export async function GET() {
  return new ImageResponse(
    (
      <div style={{
        background: '#ffffff', width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        <span style={{
          fontFamily: 'Georgia, serif', fontSize: 580, fontWeight: 700,
          color: 'white', lineHeight: 1,
          textShadow: '6px 0 0 #e00,  -6px 0 0 #e00, 0 6px 0 #e00, 0 -6px 0 #e00, 5px 5px 0 #e00, -5px 5px 0 #e00, 5px -5px 0 #e00, -5px -5px 0 #e00',
        }}>V</span>
        <span style={{
          fontFamily: 'Georgia, serif', fontSize: 90, fontWeight: 600,
          color: '#cc0000', letterSpacing: 12,
        }}>LENS VERITAS</span>
      </div>
    ),
    { width: 1024, height: 1024 }
  )
}
