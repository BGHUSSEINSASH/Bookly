import Link from 'next/link';
import { Smartphone, Play, Monitor } from 'lucide-react';
import { PhoneFrame } from './phone-frame';
import { ScreenExplore } from './phone-screens';
import { Reveal } from './reveal';

/* رمز زخرفي يوحي بـ QR — SVG بسيط */
function QrPlaceholder() {
  const cells = [
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
    [0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0],
    [1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1],
    [0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1],
    [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0],
  ];
  return (
    <svg viewBox="0 0 21 21" className="h-24 w-24 rounded-md bg-white p-1" aria-hidden>
      {cells.map((row, y) =>
        row.map((v, x) => (v ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#054f40" /> : null)),
      )}
    </svg>
  );
}

export function DownloadCta() {
  return (
    <section id="download" className="scroll-mt-20 bg-[var(--night)] py-24 lg:py-32">
      <div className="container-bookly grid items-center gap-16 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <Reveal>
            <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--color-clay-200)]">
              حمّل بوكلي
            </p>
            <h2 className="display-xl mt-4 text-white">
              حجوزاتك كلها
              <br />
              في جيبك.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-8 text-white/60">
              حمّل التطبيق واحجز في دقائق — أو استخدم نسخة الويب مباشرة من المتصفح.
              نفس الحساب، نفس المحفظة، نفس الحجوزات.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-2.5 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[var(--night)] transition hover:bg-white/90"
              >
                <Smartphone className="h-4.5 w-4.5" />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] font-normal text-[#152520]/55">حمّل من</span>
                  <span>App Store</span>
                </span>
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2.5 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[var(--night)] transition hover:bg-white/90"
              >
                <Play className="h-4.5 w-4.5 fill-current" />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] font-normal text-[#152520]/55">حمّل من</span>
                  <span>Google Play</span>
                </span>
              </a>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2.5 rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/50"
              >
                <Monitor className="h-4.5 w-4.5" />
                نسخة الويب
              </Link>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-10 flex items-center gap-5">
              <QrPlaceholder />
              <p className="max-w-[220px] text-[12.5px] leading-6 text-white/45">
                وجّه كاميرا هاتفك للرمز لفتح صفحة التحميل مباشرة.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={180} className="flex justify-center lg:justify-end">
          <div className="relative">
            <div className="absolute -inset-10 rounded-full bg-[var(--brand)]/20 blur-3xl" aria-hidden />
            <div className="relative lg:rotate-[4deg]">
              <PhoneFrame>
                <div className="phone-app-screen is-active">
                  <ScreenExplore />
                </div>
              </PhoneFrame>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
