import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'بوكلي — احجز مكاناً يشبهك';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #054F40 0%, #0B8A6A 60%, #07705A 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: '#D7E64B',
              color: '#054F40',
              fontSize: 56,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ب
          </div>
          <div style={{ fontSize: 64, fontWeight: 900 }}>Bookly</div>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 40,
            fontWeight: 700,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          مزارع · فنادق · شاليهات · طيران · رحلات
        </div>
        <div style={{ marginTop: 16, fontSize: 26, opacity: 0.75 }}>
          احجز مكاناً يشبهك — بدفع آمن ومحفظة تُسترد فورًا
        </div>
      </div>
    ),
    { ...size },
  );
}
