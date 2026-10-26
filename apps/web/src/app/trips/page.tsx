import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Clock, Star } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { formatMoney } from '@/lib/format';

export const metadata: Metadata = {
  title: 'الرحلات السياحية',
  description:
    'رحلات يومية ومتعددة الأيام مع الأنشطة والإرشاد والضمانات — احجز مغامرتك التالية بسعر واضح.',
  alternates: { canonical: '/trips' },
};

export const dynamic = 'force-dynamic';

const TRIP_TYPES = [
  { key: '', label: 'الكل' },
  { key: 'MARINE', label: 'بحرية' },
  { key: 'SAFARI', label: 'سفاري' },
  { key: 'MOUNTAIN', label: 'جبلية' },
  { key: 'HERITAGE', label: 'أثرية' },
  { key: 'DESERT', label: 'صحراوية' },
  { key: 'CITY', label: 'جولات مدينة' },
];

async function get<T>(path: string): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
    const json = await res.json();
    return (json?.data ?? []) as T;
  } catch {
    return [] as unknown as T;
  }
}

export default async function TripsPage() {
  const trips = await get<any[]>('/trips?limit=40');

  return (
    <div className="container-bookly py-8">
      <div className="mb-6 flex items-start gap-2.5">
        <span className="accent-bar mt-1" />
        <div>
          <h1 className="section-title">الرحلات السياحية</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            رحلات بحرية، سفاري، جبلية، أثرية وصحراوية — منظّمة من وكالات معتمدة
          </p>
        </div>
      </div>

      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        {TRIP_TYPES.map((t) => (
          <Link
            key={t.key}
            href={t.key ? `/trips?type=${t.key}` : '/trips'}
            className="chip"
          >
            {t.label}
          </Link>
        ))}
      </div>

      {trips.length === 0 ? (
        <div className="card grid place-items-center p-16 text-center">
          <p className="font-display text-lg font-bold text-[var(--text-strong)]">
            لا توجد رحلات متاحة
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((t) => (
            <article
              key={t.id}
              className="group overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-e1)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-e3)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-soft)]">
                {t.images?.[0] ? (
                  <Image
                    src={t.images[0]}
                    alt={t.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : null}
                <span className="pill pill-glass absolute right-2.5 top-2.5">
                  {t.city?.nameAr ?? 'العراق'}
                </span>
                <span className="pill pill-glass absolute bottom-2.5 left-2.5">
                  <Clock className="h-3 w-3" />
                  {t.durationDays} يوم
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-display text-base font-bold text-[var(--text-strong)]">
                  {t.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">{t.summary}</p>

                {t.includes?.length ? (
                  <ul className="mt-3 space-y-1">
                    {t.includes.slice(0, 4).map((inc: string) => (
                      <li key={inc} className="flex items-center gap-1.5 text-xs text-[var(--text-body)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
                        {inc}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
                  <span className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-[var(--brass)] text-[var(--brass)]" />
                    <span className="font-bold text-[var(--text-strong)]">
                      {Number(t.ratingAvg ?? 0).toFixed(1)}
                    </span>
                    <span className="text-xs text-[var(--ink-300)]">({t.ratingCount ?? 0})</span>
                  </span>
                  <span className="font-display text-base font-extrabold text-[var(--brand-text)]">
                    {formatMoney(t.pricePerPerson, t.currency)}
                    <span className="text-xs font-normal text-[var(--text-muted)]"> / شخص</span>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
