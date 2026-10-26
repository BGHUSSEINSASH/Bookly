import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Users, Luggage, Star, Plane, Car as CarIcon } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { formatMoney } from '@/lib/format';

export const metadata: Metadata = {
  title: 'تأجير السيارات',
  description:
    'استئجار سيارات بأسعار يومية — استلام من المطار، سائق خاص أو قيادة ذاتية، مع مقارنة الفئات والموديلات.',
  alternates: { canonical: '/cars' },
};

export const dynamic = 'force-dynamic';

const CAR_CLASSES = [
  { key: '', label: 'الكل' },
  { key: 'ECONOMY', label: 'اقتصادية' },
  { key: 'COMPACT', label: 'مدمجة' },
  { key: 'SEDAN', label: 'سيدان' },
  { key: 'SUV', label: 'دفع رباعي' },
  { key: 'LUXURY', label: 'فاخرة' },
  { key: 'VAN', label: 'شاحنة ركاب' },
  { key: 'FAMILY', label: 'عائلية' },
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

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const category = sp.category ?? '';
  const cars = await get<any[]>(`/cars?limit=30${category ? `&category=${category}` : ''}`);

  const tomorrow = new Date(Date.now() + 86400000);
  const inThree = new Date(Date.now() + 3 * 86400000);
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const dates = `checkIn=${iso(tomorrow)}&checkOut=${iso(inThree)}&guests=1`;

  return (
    <div className="container-bookly py-8">
      <div className="mb-6 flex items-start gap-2.5">
        <span className="accent-bar mt-1" />
        <div>
          <h1 className="section-title">تأجير السيارات</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            استلام من المطار، سائق خاص، أو استئجار ذاتي — بأفضل الأسعار
          </p>
        </div>
      </div>

      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        {CAR_CLASSES.map((c) => (
          <Link
            key={c.key}
            href={c.key ? `/cars?category=${c.key}` : '/cars'}
            className={c.key === category ? 'chip chip-active' : 'chip'}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {cars.length === 0 ? (
        <div className="card grid place-items-center p-16 text-center">
          <CarIcon className="h-10 w-10 text-[var(--ink-300)]" />
          <p className="mt-3 font-display text-lg font-bold text-[var(--text-strong)]">
            لا توجد سيارات مطابقة
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((c) => (
            <article
              key={c.id}
              className="group overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-e1)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-e3)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-soft)]">
                {c.images?.[0] ? (
                  <Image
                    src={c.images[0]}
                    alt={`${c.make} ${c.model}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : null}
                {c.withDriver ? (
                  <span className="pill pill-forest absolute right-2.5 top-2.5">سائق خاص</span>
                ) : null}
                {c.airportPickup ? (
                  <span className="pill pill-glass absolute bottom-2.5 left-2.5">
                    <Plane className="h-3 w-3" />
                    استلام من المطار
                  </span>
                ) : null}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-base font-bold text-[var(--text-strong)]">
                    {c.make} {c.model}
                  </h3>
                  <span className="flex items-center gap-1 text-xs font-bold">
                    <Star className="h-3.5 w-3.5 fill-[var(--brass)] text-[var(--brass)]" />
                    {Number(c.ratingAvg ?? 0).toFixed(1)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {c.year} · {c.color ?? '—'} ·{' '}
                  {c.transmission === 'AUTOMATIC' ? 'أوتوماتيك' : 'يدوي'}
                </p>

                <div className="mt-3 flex items-center gap-4 text-xs text-[var(--text-body)]">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-[var(--brand-text)]" />
                    {c.seats} مقاعد
                  </span>
                  <span className="flex items-center gap-1">
                    <Luggage className="h-3.5 w-3.5 text-[var(--brand-text)]" />
                    {c.luggage} حقائب
                  </span>
                  <span>{c.freeKmPerDay} كم/يوم</span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
                  <span className="font-display text-lg font-extrabold text-[var(--brand-text)]">
                    {formatMoney(c.dailyRate, c.currency)}
                    <span className="text-xs font-normal text-[var(--text-muted)]"> / يوم</span>
                  </span>
                  <Link
                    href={`/checkout?target=CAR&carId=${c.id}&${dates}`}
                    className="btn btn-primary !px-4 !py-2 !text-xs"
                  >
                    احجز
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
