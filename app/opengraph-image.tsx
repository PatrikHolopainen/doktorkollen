import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0f2d4a',
          display: 'flex',
          flexDirection: 'column',
          padding: '72px 80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'rgba(29, 111, 164, 0.25)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: 300,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'rgba(29, 111, 164, 0.15)',
          }}
        />

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 60 }}>
          {/* Icon */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: '#1D6FA4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div style={{ position: 'relative', width: 36, height: 36, display: 'flex' }}>
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 0,
                  width: 36,
                  height: 12,
                  borderRadius: 4,
                  background: 'white',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 12,
                  width: 12,
                  height: 36,
                  borderRadius: 4,
                  background: 'white',
                }}
              />
            </div>
          </div>

          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ color: 'white', fontSize: 42, fontWeight: 700, letterSpacing: -1 }}>
              Doktor
            </span>
            <span style={{ color: '#4DB8FF', fontSize: 42, fontWeight: 700, letterSpacing: -1 }}>
              kollen
            </span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            color: 'white',
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: -2,
            marginBottom: 28,
            maxWidth: 800,
          }}
        >
          Hitta rätt vårdgivare i Sverige
        </div>

        {/* Subtitle */}
        <div
          style={{
            color: '#9EC8E8',
            fontSize: 28,
            fontWeight: 400,
            lineHeight: 1.4,
            marginBottom: 'auto',
            maxWidth: 680,
          }}
        >
          Sök bland läkare, kliniker och tillstånd — enkelt och snabbt.
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 40, marginTop: 48 }}>
          {[
            { value: '5 975+', label: 'Kliniker' },
            { value: '397+', label: 'Vårdgivare' },
            { value: '105+', label: 'Tillstånd' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(29, 111, 164, 0.35)',
                border: '1px solid rgba(77, 184, 255, 0.25)',
                borderRadius: 16,
                padding: '20px 32px',
                minWidth: 160,
              }}
            >
              <span style={{ color: '#4DB8FF', fontSize: 36, fontWeight: 700, lineHeight: 1 }}>
                {stat.value}
              </span>
              <span style={{ color: '#9EC8E8', fontSize: 18, marginTop: 6 }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Domain badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 80,
            color: 'rgba(158, 200, 232, 0.6)',
            fontSize: 22,
            fontWeight: 500,
          }}
        >
          doktorkollen.com
        </div>
      </div>
    ),
    { ...size }
  )
}
