'use client';

import { useEffect, useRef, useState } from 'react';
import { PhoneFrame } from './phone-frame';
import { PHONE_SCREENS, type PhoneScreenKey } from './phone-screens';

const STEPS: {
  key: PhoneScreenKey;
  num: string;
  title: string;
  body: string;
  points: string[];
}[] = [
  {
    key: 'explore',
    num: '٠١',
    title: 'اكتشف ما يناسبك',
    body: 'مزارع، فنادق، شاليهات ورحلات — كل شيء في مكان واحد، بصور حقيقية وأسعار واضحة بدون مفاجآت.',
    points: ['بحث ذكي بالفئة والمدينة', 'تقييمات موثوقة من ضيوف سابقين'],
  },
  {
    key: 'property',
    num: '٠٢',
    title: 'اعرف كل التفاصيل',
    body: 'صفحة كاملة لكل عقار: المميزات، الصور، قربه من الخدمات، وسياسة الإلغاء — قبل أن تدفع دينارًا واحدًا.',
    points: ['مميزات ومرافق مفصّلة', 'اتصال مباشر بالمالك'],
  },
  {
    key: 'booking',
    num: '٠٣',
    title: 'أكمل الحجز في ٤ خطوات',
    body: 'التاريخ، الضيوف، الكوبون، ثم الدفع. ملخص واضح للمبلغ قبل التأكيد — ولا رسوم خفية.',
    points: ['ملخص فوري قبل الدفع', 'كوبونات خصم قابلة للتطبيق'],
  },
  {
    key: 'wallet',
    num: '٠٤',
    title: 'استرد فورًا إلى محفظتك',
    body: 'أي إلغاء يسترد أموالك إلى محفظة Bookly فورًا — تسترد نقدًا أو تستخدمها في حجزك القادم، وتربح نقاط ولاء مع كل حجز.',
    points: ['استرداد فوري ١٠٠٪ أو ٥٠٪', 'نقاط تراكم مع كل إقامة'],
  },
];

const SCREEN_ORDER: PhoneScreenKey[] = ['explore', 'property', 'booking', 'wallet'];

export function PhoneShowcase() {
  const [active, setActive] = useState<PhoneScreenKey>('explore');
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');
  const prevIdx = useRef(0);
  const blocksRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const key = (e.target as HTMLElement).dataset.screen as PhoneScreenKey;
            if (key && key !== active) {
              const newIdx = SCREEN_ORDER.indexOf(key);
              setDir(newIdx >= prevIdx.current ? 'fwd' : 'back');
              prevIdx.current = newIdx;
              setActive(key);
            }
          }
        }
      },
      { rootMargin: '-42% 0px -42% 0px', threshold: 0 },
    );
    for (const el of blocksRef.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, [active]);

  return (
    <div className="grid items-start gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
      {/* الهاتف — ثابت أثناء التمرير */}
      <div className="sticky top-24 z-10 mx-auto hidden lg:block">
        <div className="relative">
          <div className="hero-glow -top-10 right-1/2 translate-x-1/2" aria-hidden />
          <PhoneFrame>
            {Object.entries(PHONE_SCREENS).map(([key, Screen]) => (
              <div
                key={key}
                className={`phone-app-screen ${active === key ? 'is-active' : ''}`}
                aria-hidden={active !== key}
                data-screen-anim={active === key ? '' : undefined}
                style={
                  active === key
                    ? { animation: `screen-in-${dir === 'fwd' ? 'forward' : 'backward'} var(--dur-slow) var(--ease-emphasized) both` }
                    : undefined
                }
              >
                <Screen />
              </div>
            ))}
          </PhoneFrame>
        </div>
      </div>

      {/* الفقرات */}
      <div className="flex flex-col gap-24 pb-10 lg:gap-40 lg:pt-16">
        {STEPS.map((s, i) => (
          <div
            key={s.key}
            data-screen={s.key}
            ref={(el) => {
              blocksRef.current[i] = el;
            }}
            className={`transition-opacity duration-500 ${active === s.key ? 'opacity-100' : 'opacity-45 lg:opacity-100'}`}
          >
            <p className="eyebrow">{s.num}</p>
            <h3 className="display-lg mt-3 text-[var(--text-strong)]">{s.title}</h3>
            <p className="mt-4 max-w-md text-[15px] leading-8 text-[var(--text-muted)]">{s.body}</p>
            <ul className="mt-5 space-y-2.5">
              {s.points.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-[13.5px] text-[var(--text-body)]">
                  <span className="accent-bar" />
                  {p}
                </li>
              ))}
            </ul>

            {/* الهاتف المصغّر للموبايل */}
            <div className="mt-8 lg:hidden">
              <PhoneFrame className="mx-auto">
                <div className="phone-app-screen is-active">
                  <PhoneScreenFor k={s.key} />
                </div>
              </PhoneFrame>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhoneScreenFor({ k }: { k: PhoneScreenKey }) {
  const Screen = PHONE_SCREENS[k];
  return <Screen />;
}
