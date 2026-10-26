import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  Clock, Star, Users, MapPin, Check, X, Calendar, ChevronLeft,
  Mountain, Anchor, Compass, Landmark, Sun, Building2, Shield,
} from 'lucide-react';
import { API_URL } from '@/lib/api';
import { formatMoney } from '@/lib/format';

export const dynamic = 'force-dynamic';

async function getTrip(slug: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_URL}/trips/${encodeURIComponent(slug)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? json;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const trip = await getTrip(params.slug);
  if (!trip) return { title: 'رحلة غير موجودة' };
  return {
    title: `${trip.title} — Bookly`,
    description: trip.summary ?? '',
    openGraph: {
      title: trip.title,
      images: trip.images?.[0] ? [{ url: trip.images[0] }] : [],
    },
  };
}

const TYPE_ICONS: Record<string, React.ComponentType<any>> = {
  MARINE: Anchor, SAFARI: Compass, MOUNTAIN: Mountain,
  HERITAGE: Landmark, DESERT: Sun, CITY: Building2, ADVENTURE: Compass,
};
const TYPE_LABELS: Record<string, string> = {
  MARINE: 'بحرية', SAFARI: 'سفاري', MOUNTAIN: 'جبلية',
  HERITAGE: 'أثرية', DESERT: 'صحراوية', CITY: 'جولات مدينة', ADVENTURE: 'مغامرات',
};
const DIFFICULTY: Record<string, { label: string; color: string }> = {
  EASY:   { label: 'سهل',    color: 'bg-green-100 text-green-700' },
  MEDIUM: { label: 'متوسط',  color: 'bg-yellow-100 text-yellow-700' },
  HARD:   { label: 'صعب',    color: 'bg-red-100 text-red-700' },
};

export default async function TripDetailPage({ params }: { params: { slug: string } }) {
  const trip = await getTrip(params.slug);
  if (!trip) notFound();

  const Icon = TYPE_ICONS[trip.type] ?? Compass;

  return (
    <div className="container-bookly py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--brand)]">الرئيسية</Link>
        <ChevronLeft className="h-3 w-3" />
        <Link href="/trips" className="hover:text-[var(--brand)]">الرحلات</Link>
        <ChevronLeft className="h-3 w-3" />
        <span className="text-[var(--text-strong)]">{trip.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* ─── المحتوى الرئيسي ─── */}
        <div className="space-y-6">
          {/* Gallery */}
          <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-card)] bg-[var(--bg-soft)]">
            {trip.images?.[0] ? (
              <Image
                src={trip.images[0]}
                alt={trip.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 65vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-7xl">🗺️</div>
            )}
            {trip.images?.length > 1 && (
              <div className="absolute bottom-3 left-3 flex gap-1.5">
                {trip.images.slice(1, 4).map((url: string, i: number) => (
                  <div key={i} className="relative h-16 w-20 overflow-hidden rounded-lg border-2 border-white">
                    <Image src={url} alt="" fill className="object-cover" />
                  </div>
                ))}
                {trip.images.length > 4 && (
                  <div className="flex h-16 w-20 items-center justify-center rounded-lg border-2 border-white bg-black/60 text-sm font-bold text-white">
                    +{trip.images.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="flex items-center gap-1.5 rounded-full bg-[var(--brand-soft)] px-3 py-1 text-sm font-medium text-[var(--brand-text)]">
                <Icon className="h-4 w-4" />
                {TYPE_LABELS[trip.type] ?? trip.type}
              </span>
              {trip.difficultyLevel && DIFFICULTY[trip.difficultyLevel] && (
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${DIFFICULTY[trip.difficultyLevel].color}`}>
                  {DIFFICULTY[trip.difficultyLevel].label}
                </span>
              )}
              {trip.minAge && (
                <span className="rounded-full bg-[var(--bg-soft)] px-3 py-1 text-sm text-[var(--text-muted)]">
                  +{trip.minAge} سنة
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-strong)] lg:text-3xl">{trip.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
              {trip.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {trip.city.nameAr}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {trip.durationDays} يوم
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {trip.minGuests}–{trip.maxGuests} شخص
              </span>
              {trip.ratingCount > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-[var(--brass)] text-[var(--brass)]" />
                  {Number(trip.ratingAvg).toFixed(1)} ({trip.ratingCount} تقييم)
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {trip.description && (
            <section>
              <h2 className="mb-3 text-lg font-bold text-[var(--text-strong)]">عن الرحلة</h2>
              <p className="text-sm leading-7 text-[var(--text-body)] whitespace-pre-line">
                {trip.description}
              </p>
            </section>
          )}

          {/* Highlights */}
          {trip.highlights?.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold text-[var(--text-strong)]">أبرز ما في الرحلة</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {trip.highlights.map((h: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-body)]">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Includes / Excludes */}
          <div className="grid gap-6 sm:grid-cols-2">
            {trip.includes?.length > 0 && (
              <section>
                <h2 className="mb-3 text-base font-bold text-[var(--text-strong)]">✅ يشمل</h2>
                <ul className="space-y-2">
                  {trip.includes.map((inc: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-body)]">
                      <Check className="h-4 w-4 shrink-0 text-green-500" />
                      {inc}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {trip.excludes?.length > 0 && (
              <section>
                <h2 className="mb-3 text-base font-bold text-[var(--text-strong)]">❌ لا يشمل</h2>
                <ul className="space-y-2">
                  {trip.excludes.map((exc: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <X className="h-4 w-4 shrink-0 text-red-400" />
                      {exc}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Itinerary */}
          {Array.isArray(trip.itinerary) && trip.itinerary.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold text-[var(--text-strong)]">البرنامج اليومي</h2>
              <ol className="space-y-4">
                {trip.itinerary.map((day: any, i: number) => (
                  <li key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">
                        {i + 1}
                      </span>
                      {i < trip.itinerary.length - 1 && (
                        <div className="mt-2 h-full w-0.5 bg-[var(--border-subtle)]" />
                      )}
                    </div>
                    <div className="pb-4">
                      <h3 className="font-semibold text-[var(--text-strong)]">
                        اليوم {i + 1}{day.title ? `: ${day.title}` : ''}
                      </h3>
                      {day.description && (
                        <p className="mt-1 text-sm text-[var(--text-body)]">{day.description}</p>
                      )}
                      {day.activities?.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {day.activities.map((act: string, j: number) => (
                            <li key={j} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                              <span className="h-1 w-1 rounded-full bg-[var(--text-muted)]" />
                              {act}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Meeting Point */}
          {trip.meetingPoint && (
            <section className="rounded-xl border border-[var(--border-subtle)] p-4">
              <h2 className="mb-2 text-base font-bold text-[var(--text-strong)] flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--brand)]" />
                نقطة التجمع
              </h2>
              <p className="text-sm text-[var(--text-body)]">{trip.meetingPoint}</p>
            </section>
          )}

          {/* Vendor */}
          {trip.vendor && (
            <section className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-xl font-bold text-[var(--brand-text)]">
                {trip.vendor.companyName?.[0] ?? 'V'}
              </div>
              <div>
                <p className="font-semibold text-[var(--text-strong)]">{trip.vendor.companyName}</p>
                {trip.vendor.ratingAvg > 0 && (
                  <span className="flex items-center gap-1 text-sm text-[var(--text-muted)]">
                    <Star className="h-3.5 w-3.5 fill-[var(--brass)] text-[var(--brass)]" />
                    {Number(trip.vendor.ratingAvg).toFixed(1)}
                  </span>
                )}
              </div>
              <div className="mr-auto">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
            </section>
          )}

          {/* Similar trips */}
          {trip.similar?.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold text-[var(--text-strong)]">رحلات مشابهة</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {trip.similar.slice(0, 4).map((s: any) => (
                  <Link key={s.id} href={`/trips/${s.slug ?? s.id}`}
                    className="flex gap-3 rounded-xl border border-[var(--border-subtle)] p-3 hover:bg-[var(--bg-soft)] transition">
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-soft)]">
                      {s.images?.[0] && <Image src={s.images[0]} alt={s.title} fill className="object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[var(--text-strong)] line-clamp-1">{s.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">{s.durationDays} يوم • {s.city?.nameAr}</p>
                      <p className="mt-1 text-sm font-bold text-[var(--brand-text)]">
                        {formatMoney(s.pricePerPerson, s.currency)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ─── Booking Sidebar ─── */}
        <div className="sticky top-24 h-fit space-y-4">
          <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-e2)]">
            <div className="mb-4">
              <span className="font-display text-3xl font-extrabold text-[var(--brand-text)]">
                {formatMoney(trip.pricePerPerson, trip.currency)}
              </span>
              <span className="text-sm text-[var(--text-muted)]"> / شخص</span>
            </div>

            {/* Schedules */}
            {trip.schedules?.length > 0 ? (
              <div className="mb-4">
                <p className="mb-2 text-sm font-semibold text-[var(--text-strong)]">
                  <Calendar className="inline h-4 w-4 ml-1 text-[var(--brand)]" />
                  المواعيد المتاحة
                </p>
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {trip.schedules.map((s: any) => (
                    <label key={s.id}
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-[var(--border-subtle)] p-3 hover:bg-[var(--bg-soft)] transition">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-strong)]">
                          {new Date(s.departureDate).toLocaleDateString('ar-IQ', {
                            weekday: 'short', year: 'numeric', month: 'long', day: 'numeric',
                          })}
                        </p>
                        {s.guide && (
                          <p className="text-xs text-[var(--text-muted)]">
                            مرشد: {s.guide.fullName}
                          </p>
                        )}
                      </div>
                      <div className="text-left">
                        {s.seatsLeft !== null && (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            s.seatsLeft <= 3 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                          }`}>
                            {s.seatsLeft} مقعد
                          </span>
                        )}
                        {s.priceOverride && (
                          <p className="mt-0.5 text-xs font-bold text-[var(--brand-text)]">
                            {formatMoney(s.priceOverride, trip.currency)}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-4 rounded-lg bg-[var(--bg-soft)] p-3 text-center text-sm text-[var(--text-muted)]">
                لا توجد مواعيد قادمة — تواصل مع المنظّم
              </div>
            )}

            <Link
              href={`/booking?type=TRIP&tripId=${trip.id}`}
              className="btn-primary block w-full rounded-xl py-3 text-center font-bold"
            >
              احجز الآن
            </Link>

            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-[var(--text-muted)]">
              <Shield className="h-3.5 w-3.5 text-green-500" />
              استرداد كامل خلال 48 ساعة
            </div>
          </div>

          {/* Quick info */}
          <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
            <h3 className="mb-3 text-sm font-bold text-[var(--text-strong)]">معلومات سريعة</h3>
            <dl className="space-y-2 text-sm">
              {[
                { label: 'المدة', value: `${trip.durationDays} يوم` },
                { label: 'الحد الأقصى', value: `${trip.maxGuests} شخص` },
                { label: 'الحد الأدنى', value: `${trip.minGuests} شخص` },
                ...(trip.difficultyLevel ? [{ label: 'المستوى', value: DIFFICULTY[trip.difficultyLevel]?.label ?? trip.difficultyLevel }] : []),
                ...(trip.minAge ? [{ label: 'العمر الأدنى', value: `${trip.minAge}+` }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-[var(--text-muted)]">{label}</dt>
                  <dd className="font-medium text-[var(--text-strong)]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
