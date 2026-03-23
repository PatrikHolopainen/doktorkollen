import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: '#1D6FA4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ position: 'relative', width: 100, height: 100, display: 'flex' }}>
          <div
            style={{
              position: 'absolute',
              top: 34,
              left: 0,
              width: 100,
              height: 32,
              borderRadius: 8,
              background: 'white',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 34,
              width: 32,
              height: 100,
              borderRadius: 8,
              background: 'white',
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  )
}
