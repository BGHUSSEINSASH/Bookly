import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Reveal } from '@/components/marketing/reveal';

export function LoyaltySection() {
  const tiers = [
    { name: 'فضي', points: '0 – 999', perk: 'نقاط مع كل حجز', accent: false },
    { name: 'ذهبي', points: '1,000 – 4,999', perk: 'معامل 1.5× + أولوية دعم', accent: true },
    { name: 'بلاتيني', points: '5,000+', perk: 'معامل 2× + عروض حصرية', accent: false },
  ];

  return (
    <section className="border-y border-[var(--border-subtle)] py-20 lg:py-24">
      <div className="container-bookly">
        <Reveal className="mb-12 max-w-2xl">
          <p className="eyebrow">نقاط الولاء</p>
          <h2 className="display-lg mt-3 text-[var(--text-strong)]">
            كل رحلة تُكافئك
            <br />
            في الرحلة القادمة.
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-[var(--text-muted)]">
            اكسب نقاطًا مع كل حجز مكتمل، وارتقِ بين المستويات، وحوّل نقاطك إلى رصيد شراء فوري من
            محفظتك — دون قسائم ولا شروط معقّدة.
          </p>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 90}>
              <div
                className={`card h-full p-6 ${
                  t.accent ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]/40' : ''
                }`}
              >
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    t.accent
                      ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                      : 'bg-[var(--brand-soft)] text-[var(--brand-text)]'
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  {t.name}
                </span>
                <p className="mt-4 font-display text-xl font-black text-[var(--text-strong)]">
                  {t.points}
                </p>
                <p className="mt-1 text-xs text-[var(--text-faint)]">نقطة</p>
                <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{t.perk}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={150} className="mt-8">
          <Link href="/wallet" className="btn btn-outline inline-flex">
            عرض نقاطي في المحفظة
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
