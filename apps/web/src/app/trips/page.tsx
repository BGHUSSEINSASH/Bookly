import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Clock, Star, Users, Mountain, Search, Calendar, ChevronLeft } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { formatMoney } from '@/lib/format';

export const metadata: Metadata = {
  title: 'الرحلات السياحية',
  description: 'رحلات يومية ومتعددة الأيام مع الأنشطة والإرشاد والضمانات — احجز مغامرتك التالية بسعر واضح.',
  alternates: { canonical: '/trips' },
};

const TRIP_TYPES = [
  { key: '',          label: 'الكل',         emoji: '🗺️' },
  { key: 'MARINE',    label: 'بحرية',         emoji: '⛵' },
  { key: 'SAFARI',    label: 'سفاري',         emoji: '🦁' },
  { key: 'MOUNTAIN',  label: 'جبلية',         emoji: '⛰️' },
  { key: 'HERITAGE',  label: 'أثرية',         emoji: '🏛️' },
  { key: 'DESERT',    label: 'صحراوية',       emoji: '🏜️' },
  { key: 'CITY',      label: 'جولات مدينة',  emoji: '🏙️' },
  { key: 'ADVENTURE', label: 'مغامرات',       emoji: '🧭' },
];

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  EASY:   { label: 'سهل',    color: 'bg-green-100 text-green-700' },
  MEDIUM: { label: 'متوسط',  color: 'bg-yellow-100 text-yellow-700' },
  HARD:   { label: 'صعب',    color: 'bg-red-100 text-red-700' },
};

async function getTrips(type: string, q: string) {
  try {
    const params = new URLSearchParams({ limit: '30' });
    if (type) params.set('type', type);
    if (q)    params.set('q', q);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res  = await fetch(`${API_URL}/trips?${params}`, { signal: controller.signal, next: { revalidate: 60 } });
    clearTimeout(timeout);
    const json = await res.json();
    const d = json?.data ?? json;
    return (d?.items ?? (Array.isArray(d) ? d : [])) as any[];
  } catch {
    return [];
  }
}

export default async function TripsPage({
  searchParams,
}: {
  searchParams: { type?: string; q?: string };
}) {
  const type = searchParams.type ?? '';
  const q    = searchParams.q ?? '';
  const trips = await getTrips(type, q);

  return (
    <div className="container-bookly py-8">
      {/* Header */}
      <div className="mb-8 flex items-start gap-2.5">
        <span className="accent-bar mt-1" />
        <div>
          <h1 className="section-title">الرحلات السياحية</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            رحلات بحرية، سفاري، جبلية، أثرية وصحراوية — منظّمة من وكالات معتمدة
          </p>
        </div>
      </div>

      {/* Search bar */}
      <form action="/trips" method="GET" className="mb-5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input
              name="q"
              defaultValue={q}
              placeholder="ابحث عن رحلة..."
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            />
            {type && <input type="hidden" name="type" value={type} />}
          </div>
          <button type="submit" className="btn-primary px-5 rounded-xl text-sm">
            بحث
          </button>
        </div>
      </form>

      {/* Type filter chips */}
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
        {TRIP_TYPES.map((t) => {
          const href = t.key
            ? `/trips?type=${t.key}${q ? `&q=${q}` : ''}`
            : `/trips${q ? `?q=${q}` : ''}`;
          const active = type === t.key;
          return (
            <Link
              key={t.key}
              href={href}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                active
                  ? 'bg-[var(--brand)] text-white shadow-sm'
                  : 'bg-[var(--bg-soft)] text-[var(--text-body)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <span>{t.emoji}</span>
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Results count */}
      {trips.length > 0 && (
        <p className="mb-4 text-sm text-[var(--text-muted)]">
          {trips.length} رحلة{q ? ` لـ "${q}"` : ''}
        </p>
      )}

      {/* Grid */}
      {trips.length === 0 ? (
        <div className="card grid place-items-center p-20 text-center">
          <span className="text-5xl mb-4">🗺️</span>
          <p className="font-display text-lg font-bold text-[var(--text-strong)]">لا توجد رحلات</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">جرّب نوعاً آخر أو أزل الفلتر</p>
          <Link href="/trips" className="btn-secondary mt-4 inline-block rounded-xl px-6 py-2 text-sm">
            عرض الكل
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((t) => (
            <Link
              key={t.id}
              href={`/trips/${t.slug ?? t.id}`}
              className="group block overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-e1)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-e3)]"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-soft)]">
                {t.images?.[0] ? (
                  <Image
                    src={t.images[0]}
                    alt={t.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl">🗺️</div>
                )}
                {/* Badges */}
                <span className="pill pill-glass absolute right-2.5 top-2.5">
                  {t.city?.nameAr ?? 'العراق'}
                </span>
                <span className="pill pill-glass absolute bottom-2.5 left-2.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {t.durationDays} يوم
                </span>
                {t.nextDeparture && (
                  <span className="pill pill-glass absolute bottom-2.5 right-2.5 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(t.nextDeparture).toLocaleDateString('ar-IQ', { month: 'short', day: 'numeric' })}
                  </span>
                )}
                {t.seatsLeft !== null && t.seatsLeft <= 5 && (
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                    آخر {t.seatsLeft} مقاعد!
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  {t.difficultyLevel && DIFFICULTY_LABELS[t.difficultyLevel] && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_LABELS[t.difficultyLevel].color}`}>
                      {DIFFICULTY_LABELS[t.difficultyLevel].label}
                    </span>
                  )}
                  {t.minAge && (
                    <span className="rounded-full bg-[var(--bg-soft)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
                      +{t.minAge} سنة
                    </span>
                  )}
                </div>

                <h3 className="font-display text-base font-bold text-[var(--text-strong)] line-clamp-1">
                  {t.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">{t.summary}</p>

                {/* Includes */}
                {t.includes?.length ? (
                  <ul className="mt-3 space-y-1">
                    {(t.includes as string[]).slice(0, 3).map((inc) => (
                      <li key={inc} className="flex items-center gap-1.5 text-xs text-[var(--text-body)]">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
                        {inc}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-[var(--brass)] text-[var(--brass)]" />
                      <span className="font-bold text-[var(--text-strong)]">{Number(t.ratingAvg ?? 0).toFixed(1)}</span>
                      <span className="text-xs text-[var(--ink-300)]">({t.ratingCount ?? 0})</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <Users className="h-3 w-3" />
                      {t.maxGuests}
                    </span>
                  </div>
                  <span className="font-display text-base font-extrabold text-[var(--brand-text)]">
                    {formatMoney(t.pricePerPerson, t.currency)}
                    <span className="text-xs font-normal text-[var(--text-muted)]"> / شخص</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
