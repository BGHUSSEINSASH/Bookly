import Link from 'next/link';
import { Sprout, Building2, Home, Umbrella, Plane, Car, Compass, Building, ArrowLeft } from 'lucide-react';
import { Reveal } from './reveal';

const CATEGORIES = [
  { label: 'مزارع', icon: Sprout, href: '/search?category=FARM' },
  { label: 'فنادق', icon: Building2, href: '/search?category=HOTEL' },
  { label: 'شاليهات', icon: Home, href: '/search?category=CHALET' },
  { label: 'استراحات', icon: Umbrella, href: '/search?category=REST' },
  { label: 'شقق', icon: Building, href: '/search?category=APARTMENT' },
  { label: 'طيران', icon: Plane, href: '/flights' },
  { label: 'سيارات', icon: Car, href: '/cars' },
  { label: 'رحلات', icon: Compass, href: '/trips' },
];

export function CategoryRail() {
  return (
    <section className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="container-bookly py-14 lg:py-16">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">كل شيء في مكان واحد</p>
            <h2 className="display-xl mt-3 text-[var(--text-strong)]">ثمانية عوالم.</h2>
          </div>
          <Link
            href="/explore"
            className="group flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-text)]"
          >
            استكشف الكل
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </Link>
        </Reveal>

        <div className="mt-10 grid grid-cols-4 gap-3 lg:grid-cols-8">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.label} delay={Math.min(i, 4) * 70}>
              <Link
                href={c.href}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-7 transition-all hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-e2"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-text)] transition-colors group-hover:bg-[var(--brand)] group-hover:text-white">
                  <c.icon className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <span className="font-display text-[13px] font-semibold text-[var(--text-strong)]">{c.label}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
