import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Star } from 'lucide-react';
import { formatMoney, CATEGORY_LABELS } from '@/lib/format';
import type { PropertyCardData } from '@/components/property-card';
import { Reveal } from './reveal';
import { Rail } from './rail';

export function FeaturedRail({ properties }: { properties: PropertyCardData[] }) {
  if (!properties.length) return null;

  return (
    <section className="border-b border-[var(--border-subtle)] py-20 lg:py-28">
      <div className="container-bookly">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">مختارات هذا الأسبوع</p>
            <h2 className="display-xl mt-3 max-w-xl text-[var(--text-strong)]">أماكن تنتظر أن تُحجز.</h2>
          </div>
          <Link href="/explore" className="group flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-text)]">
            استكشف المزيد
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </Link>
        </Reveal>

        <Rail className="-mx-4 mt-12 px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          {properties.map((p, i) => (
            <Reveal
              key={p.id}
              delay={Math.min(i, 4) * 70}
              className="w-[280px] shrink-0 sm:w-[310px]"
            >
              <Link
                href={`/property/${p.slug}`}
                className="group block w-full overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-all hover:-translate-y-1 hover:shadow-e3"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-soft)]">
                  {p.images?.[0] ? (
                    <Image
                      src={p.images[0]}
                      alt={p.title}
                      fill
                      sizes="310px"
                      className="photo-warm object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : null}
                  <span className="pill pill-glass absolute top-3 right-3">
                    {CATEGORY_LABELS[p.category] ?? p.category}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-medium text-[var(--text-muted)]">{p.city?.nameAr ?? 'العراق'}</p>
                    {p.ratingCount > 0 ? (
                      <span className="flex items-center gap-1 text-[11.5px] text-[var(--text-body)]">
                        <Star className="h-3 w-3 fill-[var(--brass)] text-[var(--brass)]" />
                        {Number(p.ratingAvg).toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-1.5 line-clamp-2 font-display text-[15px] font-semibold leading-snug text-[var(--text-strong)]">
                    {p.title}
                  </h3>
                  <p className="mt-3 font-display text-sm font-bold text-[var(--brand-text)]">
                    {formatMoney(p.pricePerNight, p.currency)}
                    <span className="text-[11px] font-normal text-[var(--text-muted)]"> / ليلة</span>
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </Rail>
      </div>
    </section>
  );
}
