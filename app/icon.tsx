import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          background: '#1D6FA4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Plus / cross symbol */}
        <div style={{ position: 'relative', width: 18, height: 18, display: 'flex' }}>
          <div
            style={{
              position: 'absolute',
              top: 6,
              left: 0,
              width: 18,
              height: 6,
              borderRadius: 2,
              background: 'white',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 6,
              width: 6,
              height: 18,
              borderRadius: 2,
              background: 'white',
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  )
}
